import { Test, TestingModule } from '@nestjs/testing';
import { RbacCacheService } from '@/modules/core/rbac/services/rbac-cache.service';
import { RedisUtil } from '@/core/utils/redis.util';
import { ConfigService } from '@nestjs/config';

describe('RbacCacheService', () => {
    let service: RbacCacheService;
    let redisUtil: any;
    let configService: any;

    beforeEach(async () => {
        redisUtil = {
            isEnabled: jest.fn().mockReturnValue(true),
            get: jest.fn(),
            set: jest.fn(),
        };

        configService = {
            get: jest.fn().mockReturnValue(300),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RbacCacheService,
                {
                    provide: RedisUtil,
                    useValue: redisUtil,
                },
                {
                    provide: ConfigService,
                    useValue: configService,
                },
            ],
        }).compile();

        service = module.get<RbacCacheService>(RbacCacheService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getVersion', () => {
        it('should return 1 if redis is disabled', async () => {
            redisUtil.isEnabled.mockReturnValue(false);
            const version = await service.getVersion();
            expect(version).toBe(1);
        });

        it('should return cached version if exists', async () => {
            redisUtil.get.mockResolvedValue('5');
            const version = await service.getVersion();
            expect(version).toBe(5);
        });
    });

    describe('getUserPermissionsInGroup', () => {
        it('should return null if not in cache', async () => {
            redisUtil.get.mockResolvedValue(null);
            const result = await service.getUserPermissionsInGroup(1, 10);
            expect(result).toBeNull();
        });

        it('should return Set of permissions if in cache', async () => {
            redisUtil.get.mockImplementation((key: string) => {
                if (key === 'rbac:version') return Promise.resolve('1');
                return Promise.resolve(JSON.stringify(['p1', 'p2']));
            });
            const result = await service.getUserPermissionsInGroup(1, 10);
            expect(result).toBeInstanceOf(Set);
            expect(result?.has('p1')).toBe(true);
            expect(result?.has('p2')).toBe(true);
        });
    });

    describe('setUserPermissionsInGroup', () => {
        it('should store permissions as JSON string', async () => {
            redisUtil.get.mockResolvedValue('1');
            await service.setUserPermissionsInGroup(1, 10, ['p1']);
            expect(redisUtil.set).toHaveBeenCalledWith(
                'rbac:user:1:grp:10:v1',
                JSON.stringify(['p1']),
                300
            );
        });
    });

    describe('clearUserPermissionsInGroup', () => {
        it('should bump version', async () => {
            redisUtil.get.mockResolvedValue('1');
            await service.clearUserPermissionsInGroup(1, 10);
            expect(redisUtil.set).toHaveBeenCalledWith('rbac:version', '2');
        });
    });
});




