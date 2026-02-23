import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { AuthController } from '@/modules/core/auth/controllers/auth.controller';
import { AuthService } from '@/modules/core/auth/services/auth.service';
import { Auth } from '@/common/auth/utils';

jest.mock('@/common/auth/utils', () => ({
    Auth: {
        id: jest.fn(),
    },
}));

describe('AuthController', () => {
    let controller: AuthController;
    let authService: any;
    let configService: any;

    beforeEach(async () => {
        authService = {
            login: jest.fn(),
            register: jest.fn(),
            logout: jest.fn(),
            refreshTokenByValue: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            sendOtpForRegister: jest.fn(),
            sendOtpForForgotPassword: jest.fn(),
            handleGoogleAuth: jest.fn(),
        };

        configService = {
            get: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: ConfigService, useValue: configService },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockResponse = () => {
        const res: any = {};
        res.cookie = jest.fn().mockReturnValue(res);
        res.clearCookie = jest.fn().mockReturnValue(res);
        res.redirect = jest.fn().mockReturnValue(res);
        res.req = { hostname: 'localhost' };
        return res as Response;
    };

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('should set cookie and return result if tokens exist', async () => {
            const dto = { email: 'test@test.com', password: 'pass' };
            const mockResult = { token: 'acc', refreshToken: 'ref' };
            authService.login.mockResolvedValue(mockResult);

            const res = mockResponse();
            const result = await controller.login(dto, res);

            expect(authService.login).toHaveBeenCalledWith(dto);
            expect(res.cookie).toHaveBeenCalledWith('auth_token', 'acc', expect.any(Object));
            expect(result).toEqual(mockResult);
        });

        it('should return result without setting cookie if no token', async () => {
            const dto = { email: 'test@test.com', password: 'pass' };
            authService.login.mockResolvedValue({});

            const res = mockResponse();
            const result = await controller.login(dto, res);

            expect(res.cookie).not.toHaveBeenCalled();
            expect(result).toEqual({});
        });
    });

    describe('register', () => {
        it('should call authService.register', async () => {
            const dto = { email: 'test@test.com', password: 'p', confirmPassword: 'p', otp: '1', name: 'N', username: 'U', phone: '1' };
            authService.register.mockResolvedValue({ user: { id: 1 } });

            const result = await controller.register(dto);

            expect(authService.register).toHaveBeenCalledWith(dto);
            expect(result).toEqual({ user: { id: 1 } });
        });
    });

    describe('logout', () => {
        it('should call authService.logout and clear cookie', async () => {
            (Auth.id as jest.Mock).mockReturnValue(1);
            const res = mockResponse();

            const result = await controller.logout('Bearer token-val', res);

            expect(authService.logout).toHaveBeenCalledWith(1, 'token-val');
            expect(res.clearCookie).toHaveBeenCalledWith('auth_token', expect.any(Object));
            expect(result).toBeNull();
        });
    });

    describe('refresh', () => {
        it('should set cookie and return new tokens', async () => {
            const dto = { refreshToken: 'ref-token' };
            const mockResult = { token: 'new-acc' };
            authService.refreshTokenByValue.mockResolvedValue(mockResult);

            const res = mockResponse();
            const result = await controller.refresh(dto, res);

            expect(authService.refreshTokenByValue).toHaveBeenCalledWith('ref-token');
            expect(res.cookie).toHaveBeenCalledWith('auth_token', 'new-acc', expect.any(Object));
            expect(result).toEqual(mockResult);
        });
    });

    describe('forgotPassword', () => {
        it('should call authService.forgotPassword', async () => {
            const dto = { email: 'e' };
            authService.forgotPassword.mockResolvedValue({ message: 'sent' });
            expect(await controller.forgotPassword(dto)).toEqual({ message: 'sent' });
        });
    });

    describe('resetPassword', () => {
        it('should call authService.resetPassword', async () => {
            const dto = { email: 'e', password: 'p', confirmPassword: 'p', otp: '1' };
            authService.resetPassword.mockResolvedValue({ message: 'done' });
            expect(await controller.resetPassword(dto)).toEqual({ message: 'done' });
        });
    });

    describe('registerSendOtp', () => {
        it('should call authService.sendOtpForRegister', async () => {
            const dto = { email: 'e' };
            authService.sendOtpForRegister.mockResolvedValue({ message: 'done' });
            expect(await controller.registerSendOtp(dto)).toEqual({ message: 'done' });
        });
    });

    describe('forgotPasswordSendOtp', () => {
        it('should call authService.sendOtpForForgotPassword', async () => {
            const dto = { email: 'e' };
            authService.sendOtpForForgotPassword.mockResolvedValue({ message: 'done' });
            expect(await controller.forgotPasswordSendOtp(dto)).toEqual({ message: 'done' });
        });
    });

    describe('googleAuthCallback', () => {
        it('should redirect with tokens if successful', async () => {
            const req: any = { user: { email: 'g@g.com' } };
            const res = mockResponse();
            configService.get.mockReturnValue('http://front');
            authService.handleGoogleAuth.mockResolvedValue({ token: 't', refreshToken: 'r', expiresIn: 3600 });

            await controller.googleAuthCallback(req, res);

            expect(res.redirect).toHaveBeenCalledWith('http://front/auth/google/callback?token=t&refreshToken=r&expiresIn=3600');
        });

        it('should redirect with error if no tokens returned', async () => {
            const req: any = { user: { email: 'g@g.com' } };
            const res = mockResponse();
            configService.get.mockReturnValue('http://front');
            authService.handleGoogleAuth.mockResolvedValue(null);

            await controller.googleAuthCallback(req, res);

            expect(res.redirect).toHaveBeenCalledWith('http://front/login?error=auth_failed');
        });
    });
});




