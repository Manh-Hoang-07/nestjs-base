import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from '@/common/cache/services/cache.service';
import { RedisUtil } from '@/core/utils/redis.util';

describe('CacheService', () => {
    let service: CacheService;
    let cacheManager: any;
    let redisUtil: any;

    beforeEach(async () => {
        cacheManager = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            clear: jest.fn(),
            stores: undefined,
        };

        redisUtil = {
            isEnabled: jest.fn().mockReturnValue(false),
            del: jest.fn(),
            keys: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CacheService,
                { provide: CACHE_MANAGER, useValue: cacheManager },
                { provide: RedisUtil, useValue: redisUtil },
            ],
        }).compile();

        service = module.get<CacheService>(CacheService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('get', () => {
        it('should call cacheManager.get', async () => {
            cacheManager.get.mockResolvedValue('testVal');
            const val = await service.get('key');
            expect(val).toBe('testVal');
            expect(cacheManager.get).toHaveBeenCalledWith('key');
        });
    });

    describe('set', () => {
        it('should call cacheManager.set', async () => {
            await service.set('key', 'val', 100);
            expect(cacheManager.set).toHaveBeenCalledWith('key', 'val', 100);
        });
    });

    describe('del', () => {
        it('should prioritize redis over cacheManager if enabled', async () => {
            redisUtil.isEnabled.mockReturnValue(true);

            await service.del('key');

            expect(redisUtil.isEnabled).toHaveBeenCalled();
            expect(redisUtil.del).toHaveBeenCalledWith('key');
            expect(cacheManager.del).toHaveBeenCalledWith('key');
        });

        it('should handle del function inside cache manager wrapper', async () => {
            await service.del('key');
            expect(redisUtil.isEnabled).toHaveBeenCalled();
            expect(cacheManager.del).toHaveBeenCalledWith('key');
        });

        it('should use set with TTL 0 fallback if del is missing from cache manager', async () => {
            cacheManager.del = undefined;

            await service.del('key');

            expect(cacheManager.set).toHaveBeenCalledWith('key', undefined, 0);
        });

        it('should handle deletion failures silently in production', async () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';
            redisUtil.isEnabled.mockReturnValue(true);
            redisUtil.del.mockRejectedValue(new Error('redis error'));

            await expect(service.del('key')).resolves.not.toThrow();

            process.env.NODE_ENV = originalEnv;
        });
    });

    describe('reset', () => {
        it('should clear all cache', async () => {
            await service.reset();
            expect(cacheManager.clear).toHaveBeenCalled();
        });
    });

    describe('getOrSet', () => {
        it('should return cached value if valid (number/true string/boolean)', async () => {
            cacheManager.get.mockResolvedValue('value');
            const cb = jest.fn();

            const result = await service.getOrSet('test', cb);

            expect(cacheManager.get).toHaveBeenCalledWith('test');
            expect(cb).not.toHaveBeenCalled();
            expect(result).toBe('value');
        });

        it('should compute & set callback value if cached value is undefined', async () => {
            cacheManager.get.mockResolvedValue(undefined);
            const cb = jest.fn().mockResolvedValue('computed');

            const result = await service.getOrSet('test', cb, 500);

            expect(cb).toHaveBeenCalled();
            expect(cacheManager.set).toHaveBeenCalledWith('test', 'computed', 500);
            expect(result).toBe('computed');
        });

        it('should compute & set callback value if cached is empty string', async () => {
            cacheManager.get.mockResolvedValue('   ');
            const cb = jest.fn().mockResolvedValue('computed');

            const result = await service.getOrSet('test', cb);

            expect(cb).toHaveBeenCalled();
            expect(result).toBe('computed');
        });

        it('should compute & set callback value if cached is empty plain object', async () => {
            cacheManager.get.mockResolvedValue({});
            const cb = jest.fn().mockResolvedValue('computed');

            const result = await service.getOrSet('test', cb);

            expect(cb).toHaveBeenCalled();
            expect(result).toBe('computed');
        });
    });

    describe('deletePattern', () => {
        it('should ignore if redis disabled', async () => {
            redisUtil.isEnabled.mockReturnValue(false);
            await service.deletePattern('test:*');
            expect(redisUtil.keys).not.toHaveBeenCalled();
        });

        it('should delete keys from redis if enabled', async () => {
            redisUtil.isEnabled.mockReturnValue(true);
            redisUtil.keys.mockResolvedValue(['test:1', 'test:2']);

            await service.deletePattern('test:*');

            expect(redisUtil.keys).toHaveBeenCalledWith('test:*');
            expect(redisUtil.del).toHaveBeenCalledWith('test:1');
            expect(redisUtil.del).toHaveBeenCalledWith('test:2');
        });
    });
});




