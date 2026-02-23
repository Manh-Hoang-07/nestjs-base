import { Test, TestingModule } from '@nestjs/testing';
import { BannerService } from '@/modules/marketing/banner/admin/services/banner.service';
import { BANNER_REPOSITORY } from '@/modules/marketing/banner/domain/banner.repository';
import { BANNER_LOCATION_REPOSITORY } from '@/modules/marketing/banner-location/domain/banner-location.repository';
import { NotFoundException } from '@nestjs/common';

describe('BannerService', () => {
    let service: BannerService;
    let bannerRepo: any;
    let locationRepo: any;

    beforeEach(async () => {
        bannerRepo = {
            findMany: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        };
        locationRepo = {
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BannerService,
                { provide: BANNER_REPOSITORY, useValue: bannerRepo },
                { provide: BANNER_LOCATION_REPOSITORY, useValue: locationRepo },
            ],
        }).compile();

        service = module.get<BannerService>(BannerService);
        // Mock method in BaseContentService since we don't need to test it here
        jest.spyOn(service as any, 'getList').mockResolvedValue('list_result');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getSimpleList', () => {
        it('should call getList with default limit 50', async () => {
            const result = await service.getSimpleList({ limit: undefined });
            expect(result).toBe('list_result');
            expect((service as any).getList).toHaveBeenCalledWith({ limit: 50 });
        });
    });

    describe('beforeCreate', () => {
        it('should throw NotFoundException if location_id does not exist', async () => {
            locationRepo.findById.mockResolvedValue(null);
            await expect((service as any).beforeCreate({ location_id: 1 })).rejects.toThrow(NotFoundException);
        });

        it('should return data if location_id exists or is not provided', async () => {
            locationRepo.findById.mockResolvedValue({ id: 1 });
            const data = { location_id: 1, name: 'Test' };
            const result = await (service as any).beforeCreate(data);
            expect(result).toEqual(data);
        });
    });

    describe('beforeUpdate', () => {
        it('should throw NotFoundException if banner does not exist', async () => {
            bannerRepo.findById.mockResolvedValue(null);
            await expect((service as any).beforeUpdate(1n, {})).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if new location_id does not exist', async () => {
            bannerRepo.findById.mockResolvedValue({ id: 1, location_id: 100 });
            locationRepo.findById.mockResolvedValue(null);
            await expect((service as any).beforeUpdate(1n, { location_id: 2 })).rejects.toThrow(NotFoundException);
        });

        it('should return data if validation passes', async () => {
            bannerRepo.findById.mockResolvedValue({ id: 1n, location_id: 100 });
            locationRepo.findById.mockResolvedValue({ id: 2n });
            const data = { location_id: 2 };
            const result = await (service as any).beforeUpdate(1n, data);
            expect(result).toEqual(data);
        });
    });
});
