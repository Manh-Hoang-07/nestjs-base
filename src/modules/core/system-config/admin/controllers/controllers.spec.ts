import { Test, TestingModule } from '@nestjs/testing';
import { EmailConfigController } from './email-config.controller';
import { GeneralConfigController } from './general-config.controller';
import { EmailConfigService } from '../services/email-config.service';
import { GeneralConfigService } from '../services/general-config.service';
import { AuthService } from '@/common/auth/services';

describe('SystemConfigControllers', () => {
    let auth: any;

    beforeEach(() => {
        auth = { id: jest.fn().mockReturnValue(1) };
    });

    describe('EmailConfigController', () => {
        let controller: EmailConfigController;
        let service: any;

        beforeEach(async () => {
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

    describe('GeneralConfigController', () => {
        let controller: GeneralConfigController;
        let service: any;

        beforeEach(async () => {
            service = { getConfig: jest.fn(), updateConfig: jest.fn() };
            const module: TestingModule = await Test.createTestingModule({
                controllers: [GeneralConfigController],
                providers: [
                    { provide: GeneralConfigService, useValue: service },
                    { provide: AuthService, useValue: auth },
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
});
