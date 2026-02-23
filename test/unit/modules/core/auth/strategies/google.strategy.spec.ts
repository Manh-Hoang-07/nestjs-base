import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from '@/modules/core/auth/strategies/google.strategy';
import { AuthService } from '@/modules/core/auth/services/auth.service';

describe('GoogleStrategy', () => {
    let strategy: GoogleStrategy;
    let configService: any;
    let authService: any;

    beforeEach(async () => {
        configService = {
            get: jest.fn().mockImplementation((key) => {
                if (key === 'googleOAuth.clientId') return 'mock-client-id';
                if (key === 'googleOAuth.clientSecret') return 'mock-client-secret';
                if (key === 'googleOAuth.callbackURL') return 'mock-callback';
                return null;
            })
        };

        authService = {};

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GoogleStrategy,
                { provide: ConfigService, useValue: configService },
                { provide: AuthService, useValue: authService },
            ],
        }).compile();

        strategy = module.get<GoogleStrategy>(GoogleStrategy);
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
        expect(configService.get).toHaveBeenCalledWith('googleOAuth.clientId');
        expect(configService.get).toHaveBeenCalledWith('googleOAuth.clientSecret');
        expect(configService.get).toHaveBeenCalledWith('googleOAuth.callbackURL');
    });

    describe('validate', () => {
        it('should validate and return mapped user profile', async () => {
            const accessToken = 'access-token';
            const refreshToken = 'refresh-token';
            const profile = {
                id: '123',
                name: { givenName: 'Test', familyName: 'User' },
                emails: [{ value: 'test@example.com' }],
                photos: [{ value: 'photo.jpg' }],
            };
            const done = jest.fn();

            await strategy.validate(accessToken, refreshToken, profile, done);

            expect(done).toHaveBeenCalledWith(null, {
                googleId: '123',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                picture: 'photo.jpg',
                accessToken: 'access-token',
            });
        });
    });
});




