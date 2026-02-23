import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { AuthService } from '@/modules/core/auth/services/auth.service';
import { LoginDto } from '@/modules/core/auth/dto/login.dto';
import { RegisterDto } from '@/modules/core/auth/dto/register.dto';
import { RefreshTokenDto } from '@/modules/core/auth/dto/refresh-token.dto';
import { ForgotPasswordDto } from '@/modules/core/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '@/modules/core/auth/dto/reset-password.dto';
import { SendOtpDto } from '@/modules/core/auth/dto/send-otp.dto';
import { Auth } from '@/common/auth/utils';
import { Permission } from '@/common/auth/decorators';
import { LogRequest } from '@/common/shared/decorators';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags, ApiBody, ApiOkResponse, ApiCreatedResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiBadRequestResponse, ApiTooManyRequestsResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @LogRequest({ fileBaseName: 'auth_login' })
  @Permission('public')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Đăng nhập', description: 'Đăng nhập bằng email và mật khẩu, trả về access token và refresh token.' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Đăng nhập thành công',
    schema: {
      example: {
        success: true,
        message: 'Success',
        code: 'SUCCESS',
        httpStatus: 200,
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expiresIn: 3600,
        },
        meta: {},
        timestamp: '2026-02-24T00:24:36+07:00',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Email hoặc mật khẩu không đúng, hoặc tài khoản bị khóa. Trả về format lỗi chuẩn.',
    schema: {
      example: {
        success: false,
        message: 'Email hoặc mật khẩu không đúng.',
        code: 'ERROR',
        httpStatus: 400,
        data: null,
        meta: {},
        timestamp: '2026-02-24T00:24:36+07:00',
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'Quá số lần đăng nhập cho phép trong thời gian ngắn.',
    schema: {
      example: {
        success: false,
        message: 'Tài khoản đã bị khóa tạm thời do quá nhiều lần đăng nhập sai. Vui lòng thử lại sau 15 phút.',
        code: 'TOO_MANY_REQUESTS',
        httpStatus: 429,
        data: null,
        meta: {},
        timestamp: '2026-02-24T00:24:36+07:00',
      },
    },
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    if (result?.token) {
      const domain = (res.req.hostname === 'localhost') ? 'localhost' : undefined;
      res.cookie('auth_token', result.token, { maxAge: 60 * 60 * 1000, httpOnly: false, secure: false, domain, path: '/' });
    }
    return result;
  }

  @LogRequest({ fileBaseName: 'auth_register' })
  @Permission('public')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Đăng ký tài khoản', description: 'Đăng ký tài khoản mới bằng email, mật khẩu và OTP xác thực.' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'Đăng ký thành công, trả về thông tin user an toàn (không chứa password).',
    schema: {
      example: {
        success: true,
        message: 'Success',
        code: 'SUCCESS',
        httpStatus: 201,
        data: {
          user: {
            id: 1,
            name: 'Nguyễn Văn A',
            username: 'nguyenvana',
            email: 'user@example.com',
            phone: '0912345678',
            status: 'active',
            created_at: '2026-02-24T00:24:36+07:00',
            updated_at: '2026-02-24T00:24:36+07:00',
          },
        },
        meta: {},
        timestamp: '2026-02-24T00:24:36+07:00',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dữ liệu không hợp lệ hoặc email/tên đăng nhập/số điện thoại đã tồn tại. Trả về format lỗi chuẩn.',
    schema: {
      example: {
        success: false,
        message: 'Email đã được sử dụng.',
        code: 'ERROR',
        httpStatus: 400,
        data: null,
        meta: {},
        timestamp: '2026-02-24T00:24:36+07:00',
      },
    },
  })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Permission('public')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Đăng xuất', description: 'Đăng xuất và đưa access token hiện tại vào blacklist.' })
  @Post('logout')
  async logout(@Headers('authorization') authHeader: string, @Res({ passthrough: true }) res: Response) {
    const userId = Auth.id(undefined) as number;
    // Extract token from authorization header
    let token: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    await this.authService.logout(userId, token || undefined);
    const domain = (res.req.hostname === 'localhost') ? 'localhost' : undefined;
    res.clearCookie('auth_token', { domain, path: '/' });
    return null;
  }

  @Permission('public')
  @ApiOperation({ summary: 'Làm mới access token', description: 'Nhận access token mới từ refresh token hợp lệ.' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    description: 'Làm mới token thành công.',
    schema: {
      example: {
        success: true,
        message: 'Success',
        code: 'SUCCESS',
        httpStatus: 200,
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expiresIn: 3600,
        },
        meta: {},
        timestamp: '2026-02-24T00:24:36+07:00',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Refresh token không hợp lệ hoặc đã hết hạn.',
    schema: {
      example: {
        success: false,
        message: 'Invalid or expired token',
        code: 'ERROR',
        httpStatus: 400,
        data: null,
        meta: {},
        timestamp: '2026-02-24T00:24:36+07:00',
      },
    },
  })
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.refreshTokenByValue(dto.refreshToken);

    if (result?.token) {
      const domain = (res.req.hostname === 'localhost') ? 'localhost' : undefined;
      res.cookie('auth_token', result.token, { maxAge: 60 * 60 * 1000, httpOnly: false, secure: false, domain, path: '/' });
    }
    return result;
  }

  @LogRequest({ fileBaseName: 'auth_forgot_password' })
  @Permission('public')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute (more restrictive for password reset)
  @ApiOperation({ summary: 'Yêu cầu quên mật khẩu', description: 'Gửi email chứa mã OTP để khôi phục mật khẩu.' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({
    description: 'Yêu cầu quên mật khẩu thành công, OTP sẽ được gửi đến email.',
    schema: {
      example: {
        success: true,
        message: 'Success',
        code: 'SUCCESS',
        httpStatus: 200,
        data: {
          message: 'Mã OTP đã được gửi đến email của bạn.',
        },
        meta: {},
        timestamp: '2026-02-24T00:24:36+07:00',
      },
    },
  })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @LogRequest({ fileBaseName: 'auth_reset_password' })
  @Permission('public')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute (more restrictive for password reset)
  @ApiOperation({ summary: 'Đặt lại mật khẩu', description: 'Đổi mật khẩu bằng mã OTP đã gửi qua email.' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({
    description: 'Đổi mật khẩu thành công.',
    schema: {
      example: {
        success: true,
        message: 'Success',
        code: 'SUCCESS',
        httpStatus: 200,
        data: {
          message: 'Đổi mật khẩu thành công.',
        },
        meta: {},
        timestamp: '2026-02-24T00:24:36+07:00',
      },
    },
  })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @LogRequest({ fileBaseName: 'auth_register_send_otp' })
  @Permission('public')
  @Throttle({ default: { limit: 2, ttl: 60000 } }) // Max 2 emails per minute
  @ApiOperation({ summary: 'Gửi OTP đăng ký', description: 'Gửi mã OTP đến email để xác thực đăng ký tài khoản.' })
  @ApiBody({ type: SendOtpDto })
  @ApiOkResponse({
    description: 'OTP gửi cho đăng ký tài khoản thành công.',
    schema: {
      example: {
        success: true,
        message: 'Success',
        code: 'SUCCESS',
        httpStatus: 200,
        data: {
          message: 'Mã OTP đã được gửi đến email của bạn.',
        },
        meta: {},
        timestamp: '2026-02-24T00:24:36+07:00',
      },
    },
  })
  @Post('register/send-otp')
  async registerSendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtpForRegister(dto);
  }

  @LogRequest({ fileBaseName: 'auth_forgot_password_send_otp' })
  @Permission('public')
  @Throttle({ default: { limit: 2, ttl: 60000 } }) // Max 2 emails per minute
  @ApiOperation({ summary: 'Gửi OTP quên mật khẩu', description: 'Gửi mã OTP đến email để xác thực đặt lại mật khẩu.' })
  @ApiBody({ type: SendOtpDto })
  @ApiOkResponse({
    description: 'OTP cho quên mật khẩu được gửi thành công.',
    schema: {
      example: {
        success: true,
        message: 'Success',
        code: 'SUCCESS',
        httpStatus: 200,
        data: {
          message: 'Mã OTP đã được gửi đến email của bạn.',
        },
        meta: {},
        timestamp: '2026-02-24T00:24:36+07:00',
      },
    },
  })
  @Post('forgot-password/send-otp')
  async forgotPasswordSendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtpForForgotPassword(dto);
  }

  @LogRequest({ fileBaseName: 'auth_google' })
  @Permission('public')
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Đăng nhập bằng Google', description: 'Chuyển hướng người dùng đến trang đăng nhập Google.' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @LogRequest({ fileBaseName: 'auth_google_callback' })
  @Permission('public')
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback đăng nhập Google', description: 'Xử lý callback từ Google và redirect về frontend với token.' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const result = await this.authService.handleGoogleAuth(user);

    if (result?.token) {
      const frontendUrl = this.configService.get<string>('googleOAuth.frontendUrl') || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/google/callback?token=${result.token}&refreshToken=${result.refreshToken}&expiresIn=${result.expiresIn}`;
      return res.redirect(redirectUrl);
    }

    return res.redirect(this.configService.get<string>('googleOAuth.frontendUrl') + '/login?error=auth_failed');
  }
}
