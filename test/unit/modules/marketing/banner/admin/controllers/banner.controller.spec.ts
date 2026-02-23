import { Test, TestingModule } from '@nestjs/testing';
import { BannerController } from '@/modules/marketing/banner/admin/controllers/banner.controller';
import { BannerService } from '@/modules/marketing/banner/admin/services/banner.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

import { JwtAuthGuard, RbacGuard } from '@/common/auth/guards';
import { TokenBlacklistService } from '@/core/security/token-blacklist.service';

describe('BannerController (Admin)', () => {
    let controller: BannerController;
    let service: any;

    beforeEach(async () => {
        service = {
            create: jest.fn(),
            getList: jest.fn(),
            getSimpleList: jest.fn(),
            getOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            changeStatus: jest.fn(),
            updateSortOrder: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [BannerController],
            providers: [
                { provide: BannerService, useValue: service },
                // Provide TokenBlacklistService to satisfy JwtAuthGuard constructor deps
                { provide: TokenBlacklistService, useValue: { has: jest.fn().mockResolvedValue(false) } },
            ],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .overrideGuard(RbacGuard).useValue({ canActivate: () => true })
            .compile();

        controller = module.get<BannerController>(BannerController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call create', async () => {
        await controller.create({ name: 'Test' } as any);
        expect(service.create).toHaveBeenCalledWith({ name: 'Test' });
    });

    it('should call findAll', async () => {
        await controller.findAll({ page: 1 } as any);
        expect(service.getList).toHaveBeenCalledWith({ page: 1 });
    });

    it('should call getSimpleList', async () => {
        await controller.getSimpleList({ limit: 50 } as any);
        expect(service.getSimpleList).toHaveBeenCalledWith({ limit: 50 });
    });

    it('should call findOne', async () => {
        await controller.findOne('1');
        expect(service.getOne).toHaveBeenCalledWith(1);
    });

    it('should call update', async () => {
        await controller.update('1', { name: 'Test' } as any);
        expect(service.update).toHaveBeenCalledWith(1, { name: 'Test' });
    });

    it('should call remove', async () => {
        await controller.remove('1');
        expect(service.delete).toHaveBeenCalledWith(1);
    });

    it('should call changeStatus', async () => {
        await controller.changeStatus('1', BasicStatus.active);
        expect(service.changeStatus).toHaveBeenCalledWith(1, BasicStatus.active);
    });

    it('should call updateSortOrder', async () => {
        await controller.updateSortOrder('1', 5);
        expect(service.updateSortOrder).toHaveBeenCalledWith(1, 5);
    });
});
