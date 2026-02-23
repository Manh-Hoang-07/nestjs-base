import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '@/common/auth/guards/jwt-auth.guard';
import { TokenBlacklistService } from '@/core/security/token-blacklist.service';
import { RequestContext } from '@/common/shared/utils';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let reflector: Reflector;
    let tokenBlacklist: TokenBlacklistService;

    beforeEach(async () => {
        // We create an anonymous subclass just to wrap the guard methods if needed,
        // but we can also just use it directly since it's a class.
        // However since AuthGuard is a dynamic mixin from @nestjs/passport,
        // intercepting super.canActivate without mocking the module requires care.
        // By default, since we didn't mock passport AuthGuard here, calling it without 
        // real passport setup might throw. So we'll spy on the prototype.

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtAuthGuard,
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
                {
                    provide: TokenBlacklistService,
                    useValue: {
                        has: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<JwtAuthGuard>(JwtAuthGuard);
        reflector = module.get<Reflector>(Reflector);
        tokenBlacklist = module.get<TokenBlacklistService>(TokenBlacklistService);

        // Mock parent class (AuthGuard) canActivate
        jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate').mockResolvedValue(true);

        // Clear request context mock
        jest.spyOn(RequestContext, 'set').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createMockContext = (headers: any = {}): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers,
                }),
            }),
            getHandler: () => ({}),
            getClass: () => ({}),
        } as unknown as ExecutionContext;
    };

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should return false if token is blacklisted', async () => {
            const context = createMockContext({ authorization: 'Bearer blacklisted-token' });
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
            jest.spyOn(tokenBlacklist, 'has').mockResolvedValue(true);

            const result = await guard.canActivate(context);

            expect(result).toBe(false);
            expect(tokenBlacklist.has).toHaveBeenCalledWith('blacklisted-token');
        });

        it('should allow public access even without token if @Permission("public")', async () => {
            const context = createMockContext({});
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['public']);

            const result = await guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should allow public access and clear old auth if token is expired in @Permission("public")', async () => {
            const context = createMockContext({ authorization: 'Bearer expired-token' });
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['public']);
            jest.spyOn(tokenBlacklist, 'has').mockResolvedValue(false);

            (jwt.decode as jest.Mock).mockReturnValue({
                payload: { exp: Math.floor(Date.now() / 1000) - 1000 }
            });

            const result = await guard.canActivate(context);

            expect(result).toBe(true);
            expect(jwt.decode).toHaveBeenCalled();
        });

        it('should call passport validation if route is protected', async () => {
            const context = createMockContext({ authorization: 'Bearer valid-token' });
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
            jest.spyOn(tokenBlacklist, 'has').mockResolvedValue(false);

            const result = await guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should catch errors from passport and return false for protected routes', async () => {
            const context = createMockContext({ authorization: 'Bearer invalid' });
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
            jest.spyOn(tokenBlacklist, 'has').mockResolvedValue(false);
            jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate').mockRejectedValueOnce(new Error());

            const result = await guard.canActivate(context);
            expect(result).toBe(false);
        });
    });

    describe('handleRequest', () => {
        it('should clear auth and return null if token expired in public route', () => {
            const context = createMockContext();
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['public']);

            const result = guard.handleRequest(null, null, { name: 'TokenExpiredError' }, context);

            expect(result).toBeNull();
        });

        it('should throw HttpException if token is invalid in protected route', () => {
            const context = createMockContext();
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

            expect(() => {
                guard.handleRequest(null, null, { name: 'JsonWebTokenError' }, context);
            }).toThrow(HttpException);
        });

        it('should throw HttpException if no user in protected route', () => {
            const context = createMockContext();
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

            expect(() => {
                guard.handleRequest(null, null, null, context);
            }).toThrow(HttpException);
        });

        it('should set RequestContext and return user if successful', () => {
            const context = createMockContext();
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

            const user = { id: 1, email: 'test@example.com' };
            const result = guard.handleRequest(null, user, null, context);

            expect(result).toEqual(user);
            expect(RequestContext.set).toHaveBeenCalledWith('user', user);
            expect(RequestContext.set).toHaveBeenCalledWith('userId', user.id);
        });
    });
});




