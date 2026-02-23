import { Test, TestingModule } from '@nestjs/testing';
import { PublicGeneralConfigController } from '@/modules/core/system-config/general/public/controllers/general-config.controller';
import { PublicGeneralConfigService } from '@/modules/core/system-config/general/public/services/general-config.service';

describe('PublicGeneralConfigController', () => {
    let controller: PublicGeneralConfigController;
    let service: any;

    beforeEach(async () => {
        service = { getConfig: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PublicGeneralConfigController],
            providers: [{ provide: PublicGeneralConfigService, useValue: service }],
        }).compile();
        controller = module.get<PublicGeneralConfigController>(PublicGeneralConfigController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call service.getConfig', async () => {
        await controller.getConfig();
        expect(service.getConfig).toHaveBeenCalled();
    });
});




