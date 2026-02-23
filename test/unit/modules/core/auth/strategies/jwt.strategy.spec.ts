import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '@/modules/core/auth/strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { RedisUtil } from '@/core/utils/redis.util';
import { USER_REPOSITORY } from '@/modules/core/iam/user/domain/user.repository';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let userRepo: any;
    let redis: any;
    let config: any;

    beforeEach(async () => {
        userRepo = { findByIdWithBasicInfo: jest.fn() };
        redis = { get: jest.fn(), set: jest.fn() };
        config = { get: jest.fn().mockReturnValue('secret') };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                { provide: ConfigService, useValue: config },
                { provide: USER_REPOSITORY, useValue: userRepo },
                { provide: RedisUtil, useValue: redis },
            ],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it('should return cached user if available', async () => {
        const cachedUser = JSON.stringify({ id: '1', username: 'test' });
        redis.get.mockResolvedValue(cachedUser);

        const result = await strategy.validate({ sub: 1 });

        expect(result.id).toBe('1');
        expect(userRepo.findByIdWithBasicInfo).not.toHaveBeenCalled();
    });

    it('should load from DB if cache miss', async () => {
        redis.get.mockResolvedValue(null);
        userRepo.findByIdWithBasicInfo.mockResolvedValue({
            id: BigInt(1),
            username: 'db_user',
        });

        const result = await strategy.validate({ sub: 1 });

        expect(result.username).toBe('db_user');
        expect(redis.set).toHaveBeenCalled();
    });

    it('should return null if user not found', async () => {
        redis.get.mockResolvedValue(null);
        userRepo.findByIdWithBasicInfo.mockResolvedValue(null);

        const result = await strategy.validate({ sub: 1 });
        expect(result).toBeNull();
    });
});




