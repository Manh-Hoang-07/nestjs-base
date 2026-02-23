import { Test, TestingModule } from '@nestjs/testing';
import { ProvinceController } from '@/modules/core/location/province/public/controllers/province.controller';
import { ProvinceService } from '@/modules/core/location/province/public/services/province.service';

describe('Public ProvinceController', () => {
    let controller: ProvinceController;
    let service: any;

    beforeEach(async () => {
        service = { getList: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProvinceController],
            providers: [{ provide: ProvinceService, useValue: service }],
        }).compile();
        controller = module.get<ProvinceController>(ProvinceController);
    });

    it('should call service.getList', async () => {
        await controller.getList({ s: 'HN' });
        expect(service.getList).toHaveBeenCalledWith({ s: 'HN' });
    });
});




