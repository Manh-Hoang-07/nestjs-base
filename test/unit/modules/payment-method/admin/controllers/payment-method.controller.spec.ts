import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMethodController } from '@/modules/payment-method/admin/controllers/payment-method.controller';
import { PaymentMethodService } from '@/modules/payment-method/admin/services/payment-method.service';

import { JwtAuthGuard, RbacGuard } from '@/common/auth/guards';

describe('PaymentMethodController (Admin)', () => {
    let controller: PaymentMethodController;
    let service: any;

    beforeEach(async () => {
        service = {
            create: jest.fn(),
            getList: jest.fn(),
            getOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentMethodController],
            providers: [
                {
                    provide: PaymentMethodService,
                    useValue: service,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .overrideGuard(RbacGuard).useValue({ canActivate: () => true })
            .compile();

        controller = module.get<PaymentMethodController>(PaymentMethodController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call create', async () => {
        await controller.create({ name: 'Test' } as any);
        expect(service.create).toHaveBeenCalledWith({ name: 'Test' });
    });

    it('should call getList', async () => {
        await controller.getList({ page: 1 } as any);
        expect(service.getList).toHaveBeenCalledWith({ page: 1 });
    });

    it('should call getOne', async () => {
        await controller.getOne('1');
        expect(service.getOne).toHaveBeenCalledWith(1);
    });

    it('should call update', async () => {
        await controller.update('1', { name: 'Test' } as any);
        expect(service.update).toHaveBeenCalledWith(1, { name: 'Test' });
    });

    it('should call delete', async () => {
        await controller.delete('1');
        expect(service.delete).toHaveBeenCalledWith(1);
    });
});
