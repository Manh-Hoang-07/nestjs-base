import { Test, TestingModule } from '@nestjs/testing';
import { AdminProvinceController } from './province.controller';
import { AdminProvinceService } from '../services/province.service';

describe('Admin ProvinceController', () => {
    let controller: AdminProvinceController;
    let service: any;

    beforeEach(async () => {
        service = { getList: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AdminProvinceController],
            providers: [{ provide: AdminProvinceService, useValue: service }],
        }).compile();
        controller = module.get<AdminProvinceController>(AdminProvinceController);
    });

    it('should call service.getList', async () => {
        await controller.getList({ s: 'HN' });
        expect(service.getList).toHaveBeenCalledWith({ s: 'HN' });
    });
});
