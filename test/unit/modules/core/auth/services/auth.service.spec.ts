import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/modules/core/auth/services/auth.service';
import { USER_REPOSITORY } from '@/modules/core/iam/user/domain/user.repository';
import { RedisUtil } from '@/core/utils/redis.util';
import { TokenBlacklistService } from '@/core/security/token-blacklist.service';
import { TokenService } from '@/modules/core/auth/services/token.service';
import { AttemptLimiterService } from '@/core/security/attempt-limiter.service';
import { MailService } from '@/core/mail/mail.service';
import { ContentTemplateExecutionService } from '@/modules/core/content-template/services/content-template-execution.service';
import { UserStatus } from '@/shared/enums/types/user-status.enum';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

describe('AuthService', () => {
    let service: AuthService;
    let userRepo: any;
    let redisUtil: any;
    let tokenBlacklist: any;
    let tokenService: any;
    let lockoutService: any;
    let mailService: any;
    let contentTemplateService: any;
    let notificationQueue: any;

    beforeEach(async () => {
        userRepo = {
            findByEmailForAuth: jest.fn(),
            updateLastLogin: jest.fn(),
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            findByPhone: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
        };

        redisUtil = {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
        };

        tokenBlacklist = {
            add: jest.fn(),
        };

        tokenService = {
            generateTokens: jest.fn(),
            getRefreshTtlSec: jest.fn(),
            getAccessTtlSec: jest.fn(),
            decodeRefresh: jest.fn(),
            issueAndStoreNewTokens: jest.fn(),
        };

        lockoutService = {
            check: jest.fn(),
            add: jest.fn(),
            reset: jest.fn(),
        };

        mailService = {
            send: jest.fn(),
        };

        contentTemplateService = {
            execute: jest.fn(),
        };

        notificationQueue = {
            add: jest.fn().mockResolvedValue({}),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: USER_REPOSITORY, useValue: userRepo },
                { provide: RedisUtil, useValue: redisUtil },
                { provide: TokenBlacklistService, useValue: tokenBlacklist },
                { provide: TokenService, useValue: tokenService },
                { provide: AttemptLimiterService, useValue: lockoutService },
                { provide: MailService, useValue: mailService },
                { provide: ContentTemplateExecutionService, useValue: contentTemplateService },
                { provide: 'BullQueue_notification', useValue: notificationQueue }, // MOCK InjectQueue('notification')
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        const dto = { email: 'test@TEST.com', password: 'password123' };
        const normalizedEmail = 'test@test.com';

        it('should throw error if account is locked out', async () => {
            lockoutService.check.mockResolvedValue({ isLocked: true, remainingMinutes: 5 });

            await expect(service.login(dto)).rejects.toThrow('Tài khoản đã bị khóa tạm thời do quá nhiều lần đăng nhập sai');
        });

        it('should throw error if user not found', async () => {
            lockoutService.check.mockResolvedValue({ isLocked: false, remainingMinutes: 0 });
            userRepo.findByEmailForAuth.mockResolvedValue(null);

            await expect(service.login(dto)).rejects.toThrow('Email hoặc mật khẩu không đúng.');
            expect(userRepo.findByEmailForAuth).toHaveBeenCalledWith(normalizedEmail);
            expect(lockoutService.add).toHaveBeenCalledWith('auth:login', normalizedEmail);
        });

        it('should throw error if password mismatch', async () => {
            lockoutService.check.mockResolvedValue({ isLocked: false, remainingMinutes: 0 });
            userRepo.findByEmailForAuth.mockResolvedValue({ id: 1, email: normalizedEmail, password: 'hashed' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(dto)).rejects.toThrow('Email hoặc mật khẩu không đúng.');
            expect(lockoutService.add).toHaveBeenCalledWith('auth:login', normalizedEmail);
        });

        it('should throw error if account inactive', async () => {
            lockoutService.check.mockResolvedValue({ isLocked: false, remainingMinutes: 0 });
            userRepo.findByEmailForAuth.mockResolvedValue({ id: 1, email: normalizedEmail, password: 'hashed', status: UserStatus.inactive });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await expect(service.login(dto)).rejects.toThrow('Tài khoản đã bị khóa hoặc không hoạt động.');
        });

        it('should login successfully and return tokens', async () => {
            lockoutService.check.mockResolvedValue({ isLocked: false, remainingMinutes: 0 });
            userRepo.findByEmailForAuth.mockResolvedValue({ id: 1, email: normalizedEmail, password: 'hashed', status: UserStatus.active });
            userRepo.updateLastLogin.mockResolvedValue({});
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            tokenService.generateTokens.mockReturnValue({
                accessToken: 'acc', refreshToken: 'ref', refreshJti: 'jti', accessTtlSec: 3600
            });
            tokenService.getRefreshTtlSec.mockReturnValue(86400);
            redisUtil.set.mockResolvedValue({});

            const result = await service.login(dto);

            expect(result).toEqual({ token: 'acc', refreshToken: 'ref', expiresIn: 3600 });
            expect(lockoutService.reset).toHaveBeenCalledWith('auth:login', normalizedEmail);
            expect(userRepo.updateLastLogin).toHaveBeenCalledWith(1);
            expect(redisUtil.set).toHaveBeenCalledWith('auth:refresh:1:jti', '1', 86400);
        });
    });

    describe('register', () => {
        const dto = {
            email: 'TEST@test.com',
            password: 'pass',
            confirmPassword: 'pass',
            otp: '123456',
            name: 'Test',
            username: 'testuser',
            phone: '123'
        };
        const otpKey = 'otp:register:test@test.com';

        it('should throw if otp is invalid or missing', async () => {
            redisUtil.get.mockResolvedValue(null);
            await expect(service.register({ ...dto, otp: '654321' })).rejects.toThrow('Mã OTP không chính xác hoặc đã hết hạn.');
        });

        it('should throw if email already used', async () => {
            redisUtil.get.mockResolvedValue('123456');
            userRepo.findByEmail.mockResolvedValue({ id: 1 });
            await expect(service.register(dto)).rejects.toThrow('Email đã được sử dụng.');
        });

        it('should throw if username already used', async () => {
            redisUtil.get.mockResolvedValue('123456');
            userRepo.findByEmail.mockResolvedValue(null);
            userRepo.findByUsername.mockResolvedValue({ id: 1 });
            await expect(service.register(dto)).rejects.toThrow('Tên đăng nhập đã được sử dụng.');
        });

        it('should throw if phone already used', async () => {
            redisUtil.get.mockResolvedValue('123456');
            userRepo.findByEmail.mockResolvedValue(null);
            userRepo.findByUsername.mockResolvedValue(null);
            userRepo.findByPhone.mockResolvedValue({ id: 1 });
            await expect(service.register(dto)).rejects.toThrow('Số điện thoại đã được sử dụng.');
        });

        it('should create user, clear otp and queue success email', async () => {
            redisUtil.get.mockResolvedValue('123456');
            userRepo.findByEmail.mockResolvedValue(null);
            userRepo.findByUsername.mockResolvedValue(null);
            userRepo.findByPhone.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass');

            const mockCreatedUser = { id: 1, email: 'test@test.com', username: 'testuser', name: 'Test' };
            userRepo.create.mockResolvedValue(mockCreatedUser);

            const result = await service.register(dto);

            expect(userRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                email: 'test@test.com',
                username: 'testuser',
                password: 'hashedpass',
                status: UserStatus.active
            }));
            expect(redisUtil.del).toHaveBeenCalledWith(otpKey);
            expect(notificationQueue.add).toHaveBeenCalledWith(
                'send_email_template',
                expect.objectContaining({ templateCode: 'registration_success' }),
                expect.anything()
            );
            expect(result.user.id).toBe(1);
            expect((result.user as any).password).toBeUndefined(); // Assuming safeUser drops password
        });
    });

    describe('logout', () => {
        it('should throw if user does not exist', async () => {
            userRepo.findById.mockResolvedValue(null);
            await expect(service.logout(1, 'token')).rejects.toThrow('Người dùng không tồn tại');
        });

        it('should blacklist token if provided', async () => {
            userRepo.findById.mockResolvedValue({ id: 1 });
            tokenService.getAccessTtlSec.mockReturnValue(3600);

            await service.logout(1, 'token-value');

            expect(tokenBlacklist.add).toHaveBeenCalledWith('token-value', 3600);
        });
    });

    describe('refreshTokenByValue', () => {
        it('should throw if token is invalid or cannot be decoded', async () => {
            tokenService.decodeRefresh.mockReturnValue(null);
            await expect(service.refreshTokenByValue('invalid')).rejects.toThrow('Invalid or expired token');
        });

        it('should throw if token payload is invalid (missing sub or jti)', async () => {
            tokenService.decodeRefresh.mockReturnValue({ sub: null, jti: null });
            await expect(service.refreshTokenByValue('valid')).rejects.toThrow('Invalid or expired token');
        });

        it('should throw if refresh token is revoked/expired in redis', async () => {
            tokenService.decodeRefresh.mockReturnValue({ sub: 1, jti: 'abc' });
            redisUtil.get.mockResolvedValue(null); // Return false
            await expect(service.refreshTokenByValue('valid')).rejects.toThrow('Invalid or expired token');
        });

        it('should issue new tokens if valid active refresh token', async () => {
            tokenService.decodeRefresh.mockReturnValue({ sub: 1, jti: 'abc', email: 'e' });
            redisUtil.get.mockResolvedValue('1'); // Return true
            tokenService.issueAndStoreNewTokens.mockResolvedValue({
                accessToken: 'acc', refreshToken: 'ref', accessTtlSec: 3600
            });

            const result = await service.refreshTokenByValue('valid');

            expect(redisUtil.del).toHaveBeenCalledWith('auth:refresh:1:abc');
            expect(tokenService.issueAndStoreNewTokens).toHaveBeenCalledWith(1, 'e');
            expect(result).toEqual({ token: 'acc', refreshToken: 'ref', expiresIn: 3600 });
        });
    });

    describe('me', () => {
        it('should throw if user not found', async () => {
            userRepo.findById.mockResolvedValue(null);
            await expect(service.me(1)).rejects.toThrow('Không thể lấy thông tin user');
        });

        it('should return safe user object', async () => {
            userRepo.findById.mockResolvedValue({ id: 1, password: 'sec' });
            const result = await service.me(1);
            expect(result.id).toBe(1);
            expect((result as any).password).toBeUndefined();
        });
    });

    describe('handleGoogleAuth', () => {
        const googleUser = {
            googleId: 'g123',
            email: 'google@test.com',
            firstName: 'Google',
            lastName: 'User',
            picture: 'pic.jpg'
        };

        it('should block if account inactive', async () => {
            userRepo.findByEmail.mockResolvedValue({ id: 1, status: UserStatus.inactive });
            userRepo.update.mockResolvedValue({ id: 1, status: UserStatus.inactive });

            await expect(service.handleGoogleAuth(googleUser)).rejects.toThrow('Tài khoản đã bị khóa hoặc không hoạt động.');
        });

        it('should update existing user and generate tokens', async () => {
            userRepo.findByEmail.mockResolvedValue({ id: 1, status: UserStatus.active });
            userRepo.update.mockResolvedValue({ id: 1, status: UserStatus.active, email: googleUser.email });
            redisUtil.set.mockResolvedValue({});

            tokenService.generateTokens.mockReturnValue({
                accessToken: 'acc', refreshToken: 'ref', refreshJti: 'jti', accessTtlSec: 3600
            });
            tokenService.getRefreshTtlSec.mockReturnValue(86400);

            const result = await service.handleGoogleAuth(googleUser);

            expect(userRepo.update).toHaveBeenCalled();
            expect(redisUtil.set).toHaveBeenCalled();
            expect(result.token).toBe('acc');
            expect(result.user).toBeDefined();
        });

        it('should create new user if not exists and generate tokens', async () => {
            userRepo.findByEmail.mockResolvedValue(null);
            userRepo.create.mockResolvedValue({ id: 2, status: UserStatus.active, email: googleUser.email });
            redisUtil.set.mockResolvedValue({});

            tokenService.generateTokens.mockReturnValue({
                accessToken: 'acc', refreshToken: 'ref', refreshJti: 'jti', accessTtlSec: 3600
            });
            tokenService.getRefreshTtlSec.mockReturnValue(86400);

            const result = await service.handleGoogleAuth(googleUser);

            expect(userRepo.create).toHaveBeenCalled();
            expect(result.token).toBe('acc');
            expect(result.user).toBeDefined();
        });
    });
});




