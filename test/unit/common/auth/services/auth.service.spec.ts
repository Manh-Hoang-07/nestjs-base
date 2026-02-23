import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/common/auth/services/auth.service';
import { REQUEST } from '@nestjs/core';

describe('AuthService', () => {
    let service: AuthService;
    let mockRequest: any;

    beforeEach(async () => {
        mockRequest = {
            user: null,
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: REQUEST,
                    useValue: mockRequest,
                },
            ],
        }).compile();

        service = await module.resolve<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('user', () => {
        it('should return null if no user in request', () => {
            expect(service.user()).toBeNull();
        });

        it('should return user object if user exists in request', () => {
            const mockUser = { id: 1, email: 'test@example.com' };
            mockRequest.user = mockUser;
            expect(service.user()).toEqual(mockUser);
        });
    });

    describe('check / isLogin / guest', () => {
        it('should return correct login status', () => {
            mockRequest.user = null;
            expect(service.check()).toBe(false);
            expect(service.isLogin()).toBe(false);
            expect(service.guest()).toBe(true);

            mockRequest.user = { id: 1 };
            expect(service.check()).toBe(true);
            expect(service.isLogin()).toBe(true);
            expect(service.guest()).toBe(false);
        });
    });

    describe('get', () => {
        it('should return specific user property', () => {
            mockRequest.user = { id: 1, email: 'test@example.com' };
            expect(service.get('email')).toBe('test@example.com');
            expect((service as any).get('non-existent')).toBeUndefined();
        });
    });

    describe('shorthand methods', () => {
        it('should return correct values for id, email, username, status', () => {
            mockRequest.user = {
                id: 1,
                email: 'test@example.com',
                username: 'testuser',
                status: 'active'
            };

            expect(service.id()).toBe(1);
            expect(service.email()).toBe('test@example.com');
            expect(service.username()).toBe('testuser');
            expect(service.status()).toBe('active');
        });

        it('should return null if user not logged in', () => {
            mockRequest.user = null;
            expect(service.id()).toBeNull();
            expect(service.email()).toBeNull();
            expect(service.username()).toBeNull();
            expect(service.status()).toBeNull();
        });
    });
});




