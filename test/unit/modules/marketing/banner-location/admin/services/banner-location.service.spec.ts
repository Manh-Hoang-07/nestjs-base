import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BannerLocationService } from '@/modules/marketing/banner-location/admin/services/banner-location.service';
import {
    BANNER_LOCATION_REPOSITORY,
} from '@/modules/marketing/banner-location/domain/banner-location.repository';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

describe('BannerLocationService', () => {
    let service: BannerLocationService;
    let locationRepo: any;

    beforeEach(async () => {
        locationRepo = {
            findById: jest.fn(),
            findByCode: jest.fn(),
            update: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BannerLocationService,
                {
                    provide: BANNER_LOCATION_REPOSITORY,
                    useValue: locationRepo,
                },
            ],
        }).compile();

        service = module.get<BannerLocationService>(BannerLocationService);

        // We do not test BaseService.getList / update here
        jest.spyOn(service as any, 'getList').mockResolvedValue('list_result');
        jest.spyOn(service as any, 'update').mockResolvedValue('updated_result');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getSimpleList', () => {
        it('should call getList with default limit 50 when limit is not provided', async () => {
            const query = { search: 'homepage' };

            const result = await service.getSimpleList(query as any);

            expect((service as any).getList).toHaveBeenCalledWith({
                ...query,
                limit: 50,
            });
            expect(result).toBe('list_result');
        });

        it('should preserve custom limit when provided', async () => {
            const query = { search: 'homepage', limit: 10 };

            await service.getSimpleList(query as any);

            expect((service as any).getList).toHaveBeenCalledWith({
                ...query,
                limit: 10,
            });
        });
    });

    describe('beforeCreate', () => {
        it('should throw ConflictException if code already exists', async () => {
            locationRepo.findByCode.mockResolvedValue({ id: 1, code: 'HOME' });

            await expect(
                (service as any).beforeCreate({ name: 'Home', code: 'HOME' }),
            ).rejects.toThrow(ConflictException);

            expect(locationRepo.findByCode).toHaveBeenCalledWith('HOME');
        });

        it('should return data if code is unique', async () => {
            locationRepo.findByCode.mockResolvedValue(null);

            const payload = { name: 'Home', code: 'HOME' };
            const result = await (service as any).beforeCreate(payload);

            expect(locationRepo.findByCode).toHaveBeenCalledWith('HOME');
            expect(result).toEqual(payload);
        });

        it('should return data unchanged when code is not provided', async () => {
            const payload = { name: 'No Code Location' };
            const result = await (service as any).beforeCreate(payload);

            expect(locationRepo.findByCode).not.toHaveBeenCalled();
            expect(result).toEqual(payload);
        });
    });

    describe('beforeUpdate', () => {
        it('should throw NotFoundException if location does not exist', async () => {
            locationRepo.findById.mockResolvedValue(null);

            await expect(
                (service as any).beforeUpdate(1, { name: 'Updated' }),
            ).rejects.toThrow(NotFoundException);

            expect(locationRepo.findById).toHaveBeenCalledWith(1);
        });

        it('should throw ConflictException if new code already exists', async () => {
            locationRepo.findById.mockResolvedValue({ id: 1, code: 'OLD' });
            locationRepo.findByCode.mockResolvedValue({ id: 2, code: 'NEW' });

            await expect(
                (service as any).beforeUpdate(1, { code: 'NEW' }),
            ).rejects.toThrow(ConflictException);

            expect(locationRepo.findById).toHaveBeenCalledWith(1);
            expect(locationRepo.findByCode).toHaveBeenCalledWith('NEW');
        });

        it('should return data if validation passes and code is unchanged', async () => {
            locationRepo.findById.mockResolvedValue({ id: 1, code: 'SAME' });
            // When code is the same as current, repository.findByCode should not be called

            const data = { code: 'SAME', name: 'Updated Name' };
            const result = await (service as any).beforeUpdate(1, data);

            expect(locationRepo.findById).toHaveBeenCalledWith(1);
            expect(locationRepo.findByCode).not.toHaveBeenCalled();
            expect(result).toEqual(data);
        });

        it('should return data if validation passes and new code is unique', async () => {
            locationRepo.findById.mockResolvedValue({ id: 1, code: 'OLD' });
            locationRepo.findByCode.mockResolvedValue(null);

            const data = { code: 'NEW', name: 'Updated Name' };
            const result = await (service as any).beforeUpdate(1, data);

            expect(locationRepo.findById).toHaveBeenCalledWith(1);
            expect(locationRepo.findByCode).toHaveBeenCalledWith('NEW');
            expect(result).toEqual(data);
        });
    });

    describe('changeStatus', () => {
        it('should delegate to update with status payload', async () => {
            const result = await service.changeStatus(1, BasicStatus.active);

            expect((service as any).update).toHaveBeenCalledWith(1, {
                status: BasicStatus.active as any,
            });
            expect(result).toBe('updated_result');
        });
    });
});

