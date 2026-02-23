import { Test, TestingModule } from '@nestjs/testing';
import { WardController } from '@/modules/core/location/ward/public/controllers/ward.controller';
import { WardService } from '@/modules/core/location/ward/public/services/ward.service';

describe('Public WardController', () => {
    let controller: WardController;
    let service: any;

    beforeEach(async () => {
        service = { getList: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WardController],
            providers: [{ provide: WardService, useValue: service }],
        }).compile();
        controller = module.get<WardController>(WardController);
    });

    it('should call service.getList', async () => {
        await controller.getList({ s: 'D' });
        expect(service.getList).toHaveBeenCalledWith({ s: 'D' });
    });
});




