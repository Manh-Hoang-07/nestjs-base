import { Test, TestingModule } from '@nestjs/testing';
import { PublicGeneralConfigService } from '@/modules/core/system-config/general/public/services/general-config.service';
import { GENERAL_CONFIG_REPOSITORY } from '@/modules/core/system-config/general/domain/repositories/general-config.repository';
import { CacheService } from '@/common/cache/services';

describe('PublicGeneralConfigService', () => {
    let service: PublicGeneralConfigService;
    let generalConfigRepo: any;
    let cacheService: any;

    beforeEach(async () => {
        generalConfigRepo = {
            getConfig: jest.fn(),
            toPrimaryKey: jest.fn((id) => id),
        };

        cacheService = {
            getOrSet: jest.fn().mockImplementation((key, fn) => fn()),
            del: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PublicGeneralConfigService,
                { provide: GENERAL_CONFIG_REPOSITORY, useValue: generalConfigRepo },
                { provide: CacheService, useValue: cacheService },
            ],
        }).compile();

        service = module.get<PublicGeneralConfigService>(PublicGeneralConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getConfig', () => {
        it('should call cacheService.getOrSet', async () => {
            const mockConfig = { id: BigInt(1), site_name: 'Public Site' };
            generalConfigRepo.getConfig.mockResolvedValue(mockConfig);

            const result = await service.getConfig();

            expect(cacheService.getOrSet).toHaveBeenCalled();
            expect(result.site_name).toBe('Public Site');
        });
    });

    describe('transform', () => {
        it('should parse contact_channels if string', () => {
            const raw = {
                id: BigInt(1),
                contact_channels: JSON.stringify([{ type: 'phone', value: '123' }])
            };
            const result = (service as any).transform(raw);
            expect(Array.isArray(result.contact_channels)).toBe(true);
            expect(result.contact_channels[0].type).toBe('phone');
        });

        it('should return empty array if contact_channels invalid', () => {
            const raw = { id: BigInt(1), contact_channels: 'invalid json' };
            const result = (service as any).transform(raw);
            expect(result.contact_channels).toEqual([]);
        });
    });
});




