import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserStatus } from '@/shared/enums/types/user-status.enum';
import { RedisUtil } from '@/core/utils/redis.util';
import { TokenService } from '@/modules/core/auth/services/token.service';
import { TokenBlacklistService } from '@/core/security/token-blacklist.service';
import { AttemptLimiterService } from '@/core/security/attempt-limiter.service';
import { safeUser } from '@/modules/core/auth/utils/user.util';
import { ForgotPasswordDto } from '@/modules/core/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '@/modules/core/auth/dto/reset-password.dto';
import { LoginDto } from '@/modules/core/auth/dto/login.dto';
import { RegisterDto } from '@/modules/core/auth/dto/register.dto';
import * as crypto from 'crypto';
import { IUserRepository, USER_REPOSITORY } from '@/modules/core/iam/user/domain/user.repository';
import { MailService } from '@/core/mail/mail.service';
import { ContentTemplateExecutionService } from '@/modules/core/content-template/services/content-template-execution.service';
import { SendOtpDto } from '../dto/send-otp.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    private readonly redis: RedisUtil,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly tokenService: TokenService,
    private readonly accountLockoutService: AttemptLimiterService,
    private readonly mailService: MailService, // Keep for backward compatibility or direct usage if needed
    private readonly contentTemplateService: ContentTemplateExecutionService,
    @InjectQueue('notification')
    private readonly notificationQueue: Queue,
  ) { }

  async login(dto: LoginDto) {
    const identifier = dto.email.toLowerCase();
    const scope = 'auth:login';
    const lockout = await this.accountLockoutService.check(scope, identifier);

    if (lockout.isLocked) {
      throw new Error(
        `Tài khoản đã bị khóa tạm thời do quá nhiều lần đăng nhập sai. Vui lòng thử lại sau ${lockout.remainingMinutes} phút.`
      );
    }

    // Tìm user bằng email (case-insensitive) - repo findByEmailForAuth will include password
    const user = await this.userRepo.findByEmailForAuth(dto.email.toLowerCase());

    let authError: string | null = null;

    if (!user || !(user as any).password) {
      await this.accountLockoutService.add(scope, identifier);
      authError = 'Email hoặc mật khẩu không đúng.';
    } else {
      const isPasswordValid = await bcrypt.compare(dto.password, (user as any).password);
      if (!isPasswordValid) {
        await this.accountLockoutService.add(scope, identifier);
        authError = 'Email hoặc mật khẩu không đúng.';
      } else if (user.status !== UserStatus.active) {
        authError = 'Tài khoản đã bị khóa hoặc không hoạt động.';
      }
    }

    if (authError) {
      throw new Error(authError);
    }

    await this.accountLockoutService.reset(scope, identifier);

    this.userRepo.updateLastLogin(user!.id).catch(() => undefined);

    const numericUserId = Number(user!.id);
    const { accessToken, refreshToken, refreshJti, accessTtlSec } = this.tokenService.generateTokens(numericUserId, user!.email!);

    await this.redis
      .set(this.buildRefreshKey(numericUserId, refreshJti), '1', this.tokenService.getRefreshTtlSec())
      .catch(() => undefined);

    return { token: accessToken, refreshToken: refreshToken, expiresIn: accessTtlSec };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();

    // Verify OTP
    const otpKey = `otp:register:${email}`;
    const cachedOtp = await this.redis.get(otpKey);
    if (!cachedOtp || cachedOtp !== dto.otp) {
      throw new Error('Mã OTP không chính xác hoặc đã hết hạn.');
    }

    const existingByEmail = await this.userRepo.findByEmail(email);
    if (existingByEmail) {
      throw new Error('Email đã được sử dụng.');
    }

    if (dto.username) {
      const existingByUsername = await this.userRepo.findByUsername(dto.username);
      if (existingByUsername) {
        throw new Error('Tên đăng nhập đã được sử dụng.');
      }
    }

    if (dto.phone) {
      const existingByPhone = await this.userRepo.findByPhone(dto.phone);
      if (existingByPhone) {
        throw new Error('Số điện thoại đã được sử dụng.');
      }
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const saved = await this.userRepo.create({
      username: dto.username ?? email,
      email: email,
      phone: dto.phone ?? null,
      password: hashed,
      name: dto.name,
      status: UserStatus.active as any,
    });

    await this.redis.del(otpKey);

    // Send success email via queue (non-critical)
    this.notificationQueue.add('send_email_template', {
      templateCode: 'registration_success',
      options: {
        to: saved.email!,
        variables: {
          name: saved.name || saved.username,
          username: saved.username,
          email: saved.email,
          loginUrl: `${process.env.APP_URL}/auth/login`,
        },
      },
    }, {
      jobId: `register-success-${saved.id}`,
      attempts: 3,
      backoff: 5000,
      removeOnComplete: true,
    }).catch(err => console.error('Failed to queue registration success email', err));

    return { user: safeUser(saved) };
  }

  async logout(userId: number, token?: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    if (token) {
      const ttlSeconds = this.tokenService.getAccessTtlSec();
      await this.tokenBlacklistService.add(token, ttlSeconds);
    }
    return null;
  }

  async refreshTokenByValue(refreshToken: string) {
    try {
      let refreshError: string | null = null;
      const decoded = this.tokenService.decodeRefresh(refreshToken);
      if (!decoded) {
        refreshError = 'Invalid refresh token';
      }

      let userId: number | undefined;
      let jti: string | undefined;
      if (!refreshError) {
        userId = Number(decoded!.sub);
        jti = decoded!.jti as string | undefined;
        if (!userId || !jti || isNaN(userId)) {
          refreshError = 'Invalid refresh token';
        }
      }

      if (!refreshError) {
        const active = !!(await this.redis.get(this.buildRefreshKey(userId!, jti!)));
        if (!active) {
          refreshError = 'Refresh token revoked or expired';
        }
      }

      if (refreshError) {
        throw new Error(refreshError);
      }

      await this.redis.del(this.buildRefreshKey(userId!, jti!));

      const { accessToken, refreshToken: newRt, accessTtlSec } = await this.tokenService.issueAndStoreNewTokens(userId!, (decoded as any).email as string | undefined);

      return { token: accessToken, refreshToken: newRt, expiresIn: accessTtlSec };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  private buildRefreshKey(userId: number, jti: string): string {
    return `auth:refresh:${userId}:${jti}`;
  }

  async me(userId: number) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('Không thể lấy thông tin user');
    return safeUser(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({ email: dto.email.toLowerCase() });
    if (!user) {
      throw new Error('Email không tồn tại trong hệ thống.');
    }

    return this.sendOtpForForgotPassword({ email: dto.email });
  }

  async sendOtpForRegister(dto: SendOtpDto) {
    const email = dto.email.toLowerCase();
    const user = await this.userRepo.findByEmail(email);
    if (user) {
      throw new Error('Email đã được sử dụng.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `otp:register:${email}`;

    await this.redis.set(key, otp, 300); // 5 minutes

    await this.redis.set(key, otp, 300); // 5 minutes

    // Use Content Template
    await this.contentTemplateService.execute('send_otp_register', {
      to: email,
      variables: { otp },
    });

    return { message: 'Mã OTP đã được gửi đến email của bạn.' };
  }

  async sendOtpForForgotPassword(dto: SendOtpDto) {
    const email = dto.email.toLowerCase();
    const user = await this.userRepo.findOne({ email });
    if (!user) {
      throw new Error('Email không tồn tại trong hệ thống.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `otp:forgot-password:${email}`;

    await this.redis.set(key, otp, 300); // 5 minutes

    await this.redis.set(key, otp, 300); // 5 minutes

    // Use Content Template
    await this.contentTemplateService.execute('send_otp_forgot_password', {
      to: email,
      variables: { otp },
    });

    return { message: 'Mã OTP đã được gửi đến email của bạn.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.toLowerCase();
    if (dto.password !== dto.confirmPassword) {
      throw new Error('Mật khẩu xác nhận không khớp.');
    }

    // Verify OTP
    const otpKey = `otp:forgot-password:${email}`;
    const cachedOtp = await this.redis.get(otpKey);
    if (!cachedOtp || cachedOtp !== dto.otp) {
      throw new Error('Mã OTP không chính xác hoặc đã hết hạn.');
    }

    const user = await this.userRepo.findOne({ email });
    if (!user) {
      throw new Error('Người dùng không tồn tại.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.userRepo.update(user.id, { password: hashedPassword });
    await this.redis.del(otpKey);
    await this.accountLockoutService.reset('auth:login', email);

    // Send success email via queue (non-critical)
    this.notificationQueue.add('send_email_template', {
      templateCode: 'reset_password_success',
      options: {
        to: user.email!,
        variables: {
          name: user.name || user.username,
          time: new Date().toLocaleString('vi-VN'),
          loginUrl: `${process.env.APP_URL}/login`,
        },
      },
    }, {
      jobId: `reset-password-success-${user.id}`,
      attempts: 3,
      backoff: 5000,
      removeOnComplete: true,
    }).catch(err => console.error('Failed to queue reset password success email', err));

    return { message: 'Đổi mật khẩu thành công.' };
  }

  async handleGoogleAuth(user: {
    googleId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
  }) {
    const email = user.email.toLowerCase();

    // Chuẩn hóa data một lần
    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      email.split('@')[0];

    const username =
      email.split('@')[0] + '_' + Date.now().toString().slice(-6);

    const now = new Date();

    // Dùng upsert
    let dbUser = await this.userRepo.findByEmail(email);
    const userData = {
      name: fullName,
      image: user.picture ?? null,
      status: UserStatus.active as any,
      googleId: user.googleId,
      email_verified_at: now,
      last_login_at: now,
    };

    if (dbUser) {
      dbUser = await this.userRepo.update(dbUser.id, userData);
    } else {
      dbUser = await this.userRepo.create({
        ...userData,
        email,
        username,
      });
    }

    // Kiểm tra status
    if (dbUser.status !== UserStatus.active) {
      throw new Error('Tài khoản đã bị khóa hoặc không hoạt động.');
    }

    // Tạo token
    const numericUserId = Number(dbUser.id);
    const {
      accessToken,
      refreshToken,
      refreshJti,
      accessTtlSec,
    } = this.tokenService.generateTokens(numericUserId, dbUser.email!);

    await this.redis
      .set(
        this.buildRefreshKey(numericUserId, refreshJti),
        '1',
        this.tokenService.getRefreshTtlSec(),
      )
      .catch(() => undefined);

    return {
      token: accessToken,
      refreshToken,
      expiresIn: accessTtlSec,
      user: safeUser(dbUser as any),
    };
  }
}
