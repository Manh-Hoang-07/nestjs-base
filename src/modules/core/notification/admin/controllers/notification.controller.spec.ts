import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from '@/modules/core/notification/admin/services/notification.service';
import { JwtAuthGuard, RbacGuard } from '@/common/auth/guards';

describe('Admin NotificationController', () => {
    let controller: NotificationController;
    let service: any;

    beforeEach(async () => {
        service = {
            create: jest.fn(),
            getList: jest.fn(),
            getSimpleList: jest.fn(),
            getOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            restore: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotificationController],
            providers: [
                { provide: NotificationService, useValue: service },
            ],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .overrideGuard(RbacGuard).useValue({ canActivate: () => true })
            .compile();

        controller = module.get<NotificationController>(NotificationController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto = { title: 'Test' };
            await controller.create(dto as any);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('restore', () => {
        it('should call service.restore', async () => {
            await controller.restore('1');
            expect(service.restore).toHaveBeenCalledWith(1);
        });
    });
});
