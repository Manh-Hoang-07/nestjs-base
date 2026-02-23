import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '@/modules/core/auth/services/token.service';
import { RedisUtil } from '@/core/utils/redis.util';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

describe('TokenService', () => {
    let service: TokenService;
    let jwtService: jest.Mocked<JwtService>;
    let configService: jest.Mocked<ConfigService>;
    let redisUtil: jest.Mocked<RedisUtil>;

    beforeEach(async () => {
        const mockJwtService = {
            sign: jest.fn(),
        };
        const mockConfigService = {
            get: jest.fn(),
        };
        const mockRedisUtil = {
            isEnabled: jest.fn(),
            set: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokenService,
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: RedisUtil, useValue: mockRedisUtil },
            ],
        }).compile();

        service = module.get<TokenService>(TokenService);
        jwtService = module.get(JwtService);
        configService = module.get(ConfigService);
        redisUtil = module.get(RedisUtil);

        // Default config values
        configService.get.mockImplementation((key: string) => {
            switch (key) {
                case 'jwt.expiresIn': return '1h';
                case 'jwt.refreshExpiresIn': return '7d';
                case 'jwt.refreshSecret': return 'refresh-secret';
                case 'jwt.issuer': return 'test-issuer';
                case 'jwt.audience': return 'test-audience';
                default: return null;
            }
        });

        jest.clearAllMocks();
    });

    describe('Duration Parsing', () => {
        it('should parse durations correctly', () => {
            expect((service as any).parseDurationToSeconds('30s', 0)).toBe(30);
            expect((service as any).parseDurationToSeconds('5m', 0)).toBe(300);
            expect((service as any).parseDurationToSeconds('2h', 0)).toBe(7200);
            expect((service as any).parseDurationToSeconds('1d', 0)).toBe(86400);
        });

        it('should fallback on invalid input', () => {
            expect((service as any).parseDurationToSeconds('', 3600)).toBe(3600);
            expect((service as any).parseDurationToSeconds('invalid', 3600)).toBe(3600);
            expect((service as any).parseDurationToSeconds(null, 3600)).toBe(3600);
        });
    });

    describe('getAccessTtlSec & getRefreshTtlSec', () => {
        it('should return parsed config values', () => {
            expect(service.getAccessTtlSec()).toBe(3600); // 1h
            expect(service.getRefreshTtlSec()).toBe(604800); // 7d
        });
    });

    describe('generateTokens', () => {
        it('should generate access and refresh tokens correctly', () => {
            jwtService.sign.mockReturnValue('access-token');
            (jwt.sign as jest.Mock).mockReturnValue('refresh-token');

            const result = service.generateTokens(1, 'test@example.com');

            expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1, email: 'test@example.com' });
            expect(jwt.sign).toHaveBeenCalledWith(
                expect.objectContaining({ sub: 1, email: 'test@example.com', jti: expect.any(String) }),
                'refresh-secret',
                expect.objectContaining({ expiresIn: '7d', issuer: 'test-issuer', audience: 'test-audience' })
            );

            expect(result.accessToken).toBe('access-token');
            expect(result.refreshToken).toBe('refresh-token');
            expect(result.refreshJti).toBeDefined();
            expect(result.accessTtlSec).toBe(3600);
            expect(result.refreshTtlSec).toBe(604800);
        });
    });

    describe('verifyRefreshToken & decodeRefresh', () => {
        it('should successfully verify and decode a valid token', () => {
            const mockPayload = { sub: 1, jti: 'jti-123', email: 'test@example.com' };
            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

            const result = service.verifyRefreshToken('valid-token');
            expect(result).toEqual(mockPayload);
            expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'refresh-secret', {
                audience: 'test-audience', issuer: 'test-issuer'
            });

            const decoded = service.decodeRefresh('valid-token');
            expect(decoded).toEqual(mockPayload);
        });

        it('should return null if decode fails', () => {
            (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid'); });

            const decoded = service.decodeRefresh('invalid-token');
            expect(decoded).toBeNull();
        });
    });

    describe('issueAndStoreNewTokens', () => {
        it('should store refresh jti in redis if enabled', async () => {
            redisUtil.isEnabled.mockReturnValue(true);
            jwtService.sign.mockReturnValue('new-access');
            (jwt.sign as jest.Mock).mockReturnValue('new-refresh');

            const result = await service.issueAndStoreNewTokens(1, 'test@test.com');

            expect(result.accessToken).toBe('new-access');
            expect(result.refreshToken).toBe('new-refresh');
            expect(redisUtil.set).toHaveBeenCalledWith(expect.stringContaining('auth:refresh:1:'), '1', 604800);
        });

        it('should silently handle redis errors', async () => {
            redisUtil.isEnabled.mockReturnValue(true);
            redisUtil.set.mockRejectedValue(new Error('Redis Down'));
            jwtService.sign.mockReturnValue('new-access');
            (jwt.sign as jest.Mock).mockReturnValue('new-refresh');

            await expect(service.issueAndStoreNewTokens(1, 'test@test.com')).resolves.not.toThrow();
        });
    });
});




