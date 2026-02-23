import { Test, TestingModule } from '@nestjs/testing';
import { AdminWardController } from '@/modules/core/location/ward/admin/controllers/ward.controller';
import { AdminWardService } from '@/modules/core/location/ward/admin/services/ward.service';

describe('Admin WardController', () => {
    let controller: AdminWardController;
    let service: any;

    beforeEach(async () => {
        service = { getList: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AdminWardController],
            providers: [{ provide: AdminWardService, useValue: service }],
        }).compile();
        controller = module.get<AdminWardController>(AdminWardController);
    });

    it('should call service.getList', async () => {
        await controller.getList({ s: 'D' });
        expect(service.getList).toHaveBeenCalledWith({ s: 'D' });
    });
});




