import { Test, TestingModule } from '@nestjs/testing';
import { GeneralConfigService } from '@/modules/core/system-config/general/admin/services/general-config.service';
import { GENERAL_CONFIG_REPOSITORY } from '@/modules/core/system-config/general/domain/repositories/general-config.repository';
import { CacheService } from '@/common/cache/services';

describe('GeneralConfigService', () => {
    let service: GeneralConfigService;
    let generalConfigRepo: any;
    let cacheService: any;

    beforeEach(async () => {
        generalConfigRepo = {
            getConfig: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            toPrimaryKey: jest.fn((id) => id),
        };

        cacheService = {
            del: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GeneralConfigService,
                { provide: GENERAL_CONFIG_REPOSITORY, useValue: generalConfigRepo },
                { provide: CacheService, useValue: cacheService },
            ],
        }).compile();

        service = module.get<GeneralConfigService>(GeneralConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getConfig', () => {
        it('should return config from repo', async () => {
            const mockConfig = { id: 1, site_name: 'Test' };
            generalConfigRepo.getConfig.mockResolvedValue(mockConfig);
            const result = await service.getConfig();
            expect(result.site_name).toBe('Test');
        });
    });

    describe('updateConfig', () => {
        it('should create new config and invalidate cache', async () => {
            generalConfigRepo.getConfig.mockResolvedValue(null);
            generalConfigRepo.create.mockResolvedValue({ id: 1, site_name: 'New' });

            await service.updateConfig({ site_name: 'New' } as any);

            expect(generalConfigRepo.create).toHaveBeenCalled();
            expect(cacheService.del).toHaveBeenCalledWith('public:general-config');
        });

        it('should update existing config and invalidate cache', async () => {
            const existing = { id: 1, site_name: 'Old' };
            generalConfigRepo.getConfig.mockResolvedValue(existing);
            generalConfigRepo.update.mockResolvedValue({ ...existing, site_name: 'Updated' });

            await service.updateConfig({ site_name: 'Updated' } as any);

            expect(generalConfigRepo.update).toHaveBeenCalled();
            expect(cacheService.del).toHaveBeenCalledWith('public:general-config');
        });
    });
});




