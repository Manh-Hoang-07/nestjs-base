import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMethodController } from '@/modules/payment-method/public/controllers/payment-method.controller';
import { PublicPaymentMethodService } from '@/modules/payment-method/public/services/payment-method.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

describe('PaymentMethodController (Public)', () => {
    let controller: PaymentMethodController;
    let service: any;

    beforeEach(async () => {
        service = {
            getList: jest.fn(),
            getOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentMethodController],
            providers: [
                {
                    provide: PublicPaymentMethodService,
                    useValue: service,
                },
            ],
        }).compile();

        controller = module.get<PaymentMethodController>(PaymentMethodController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call getList with active status', async () => {
        await controller.getList();
        expect(service.getList).toHaveBeenCalledWith({ status: BasicStatus.active });
    });

    it('should call getActive with active status', async () => {
        await controller.getActive();
        expect(service.getList).toHaveBeenCalledWith({ status: BasicStatus.active });
    });

    it('should call getOne', async () => {
        await controller.getOne('1');
        expect(service.getOne).toHaveBeenCalledWith(1);
    });
});
