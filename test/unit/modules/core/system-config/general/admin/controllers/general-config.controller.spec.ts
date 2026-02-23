import { Test, TestingModule } from '@nestjs/testing';
import { GeneralConfigController } from '@/modules/core/system-config/general/admin/controllers/general-config.controller';
import { GeneralConfigService } from '@/modules/core/system-config/general/admin/services/general-config.service';
import { AuthService } from '@/common/auth/services';
import { RedisUtil } from '@/core/utils/redis.util';
import { Reflector } from '@nestjs/core';

describe('GeneralConfigController', () => {
    let auth: any;
    let controller: GeneralConfigController;
    let service: any;

    beforeEach(async () => {
        auth = { id: jest.fn().mockReturnValue(1) };
        service = { getConfig: jest.fn(), updateConfig: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GeneralConfigController],
            providers: [
                { provide: GeneralConfigService, useValue: service },
                { provide: AuthService, useValue: auth },
                { provide: RedisUtil, useValue: { isEnabled: jest.fn().mockReturnValue(false) } },
                { provide: Reflector, useValue: { get: jest.fn() } }
            ],
        }).compile();
        controller = module.get<GeneralConfigController>(GeneralConfigController);
    });

    it('should call service.getConfig', async () => {
        await controller.getConfig();
        expect(service.getConfig).toHaveBeenCalled();
    });

    it('should call service.updateConfig with userId', async () => {
        const dto = { site_name: 'Test' };
        await controller.updateConfig(dto as any);
        expect(service.updateConfig).toHaveBeenCalledWith(dto, 1);
    });
});




