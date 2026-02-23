import { Test, TestingModule } from '@nestjs/testing';
import { EmailConfigController } from '@/modules/core/system-config/email/admin/controllers/email-config.controller';
import { EmailConfigService } from '@/modules/core/system-config/email/admin/services/email-config.service';
import { AuthService } from '@/common/auth/services';

describe('EmailConfigController', () => {
    let auth: any;
    let controller: EmailConfigController;
    let service: any;

    beforeEach(async () => {
        auth = { id: jest.fn().mockReturnValue(1) };
        service = { getConfig: jest.fn(), updateConfig: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EmailConfigController],
            providers: [
                { provide: EmailConfigService, useValue: service },
                { provide: AuthService, useValue: auth },
            ],
        }).compile();
        controller = module.get<EmailConfigController>(EmailConfigController);
    });

    it('should call service.getConfig', async () => {
        await controller.getConfig();
        expect(service.getConfig).toHaveBeenCalled();
    });

    it('should call service.updateConfig with userId', async () => {
        const dto = { smtp_host: 'localhost' };
        await controller.updateConfig(dto as any);
        expect(service.updateConfig).toHaveBeenCalledWith(dto, 1);
    });
});




