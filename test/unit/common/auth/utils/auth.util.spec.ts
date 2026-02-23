import { ExecutionContext } from '@nestjs/common';
import { Auth } from '@/common/auth/utils/auth.util';
import { RequestContext } from '@/common/shared/utils';
import { AuthUser } from '@/common/auth/interfaces';

jest.mock('@/common/shared/utils', () => ({
    RequestContext: {
        get: jest.fn(),
    },
}));

describe('AuthUtil', () => {
    const mockUser: any = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        status: 'active',
    };

    const createMockContext = (user: any): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    user,
                }),
            }),
        } as unknown as ExecutionContext;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('user', () => {
        it('should return user from RequestContext if available', () => {
            (RequestContext.get as jest.Mock).mockReturnValue(mockUser);

            const result = Auth.user();

            expect(result).toEqual(mockUser);
            expect(RequestContext.get).toHaveBeenCalledWith('user');
        });

        it('should return user from ExecutionContext if RequestContext is empty', () => {
            (RequestContext.get as jest.Mock).mockReturnValue(null);
            const context = createMockContext(mockUser);

            const result = Auth.user(context);

            expect(result).toEqual(mockUser);
        });

        it('should return null if no user found in both contexts', () => {
            (RequestContext.get as jest.Mock).mockReturnValue(null);
            const context = createMockContext(null);

            const result = Auth.user(context);

            expect(result).toBeNull();
        });

        it('should return null if context is undefined and RequestContext is empty', () => {
            (RequestContext.get as jest.Mock).mockReturnValue(null);
            const result = Auth.user();
            expect(result).toBeNull();
        });
    });

    describe('id', () => {
        it('should return user id if user exists', () => {
            (RequestContext.get as jest.Mock).mockReturnValue(mockUser);

            const result = Auth.id();

            expect(result).toBe(1);
        });

        it('should return null if user does not exist', () => {
            (RequestContext.get as jest.Mock).mockReturnValue(null);

            const result = Auth.id();

            expect(result).toBeNull();
        });
    });

    describe('check / isLogin / guest', () => {
        it('should return true/false correctly when user is logged in', () => {
            (RequestContext.get as jest.Mock).mockReturnValue(mockUser);

            expect(Auth.check()).toBe(true);
            expect(Auth.isLogin()).toBe(true);
            expect(Auth.guest()).toBe(false);
        });

        it('should return true/false correctly when user is a guest', () => {
            (RequestContext.get as jest.Mock).mockReturnValue(null);

            expect(Auth.check()).toBe(false);
            expect(Auth.isLogin()).toBe(false);
            expect(Auth.guest()).toBe(true);
        });
    });

    describe('get', () => {
        it('should return specific property from user if user exists', () => {
            (RequestContext.get as jest.Mock).mockReturnValue(mockUser);

            expect(Auth.get(undefined, 'email')).toBe('test@example.com');
            expect(Auth.get(undefined, 'status')).toBe('active');
        });

        it('should return undefined if user property does not exist', () => {
            (RequestContext.get as jest.Mock).mockReturnValue(mockUser);

            // Let's pretend user does not have this property
            expect((Auth as any).get(undefined, 'nonexistent')).toBeUndefined();
        });

        it('should return undefined if user does not exist', () => {
            (RequestContext.get as jest.Mock).mockReturnValue(null);

            expect(Auth.get(undefined, 'email')).toBeUndefined();
        });
    });
});




