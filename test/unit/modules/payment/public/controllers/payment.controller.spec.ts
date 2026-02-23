import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from '@/modules/payment/public/controllers/payment.controller';
import { PaymentService } from '@/modules/payment/public/services/payment.service';
import { PaymentProcessorService } from '@/modules/payment/public/services/payment-processor.service';
import { PaymentManagementService } from '@/modules/payment/public/services/payment-management.service';

describe('PaymentController', () => {
    let controller: PaymentController;
    let paymentService: any;
    let paymentProcessor: any;
    let paymentManagement: any;

    beforeEach(async () => {
        paymentService = {
            create: jest.fn(),
        };
        paymentProcessor = {
            verifyAndProcess: jest.fn(),
            handleWebhook: jest.fn(),
        };
        paymentManagement = {
            getList: jest.fn(),
            getOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentController],
            providers: [
                { provide: PaymentService, useValue: paymentService },
                { provide: PaymentProcessorService, useValue: paymentProcessor },
                { provide: PaymentManagementService, useValue: paymentManagement },
            ],
        }).compile();

        controller = module.get<PaymentController>(PaymentController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call createPaymentUrl', async () => {
        await controller.createPaymentUrl({ order_id: 1 } as any);
        expect(paymentService.create).toHaveBeenCalledWith({ order_id: 1 });
    });

    it('should call createPayment', async () => {
        await controller.createPayment({ order_id: 1 } as any);
        expect(paymentService.create).toHaveBeenCalledWith({ order_id: 1 });
    });

    it('should manage vnpayReturn redirect on success', async () => {
        const res = { redirect: jest.fn() } as any;
        paymentProcessor.verifyAndProcess.mockResolvedValue({ success: true, order_id: 123 });
        await controller.vnpayReturn({ vnp_Amount: 100 }, res);
        expect(paymentProcessor.verifyAndProcess).toHaveBeenCalledWith('vnpay', { vnp_Amount: 100 });
        expect(res.redirect).toHaveBeenCalledWith('/payment/success?order_id=123');
    });

    it('should manage vnpayReturn redirect on fail', async () => {
        const res = { redirect: jest.fn() } as any;
        paymentProcessor.verifyAndProcess.mockResolvedValue({ success: false, message: 'Lỗi' });
        await controller.vnpayReturn({ vnp_Amount: 100 }, res);
        expect(paymentProcessor.verifyAndProcess).toHaveBeenCalledWith('vnpay', { vnp_Amount: 100 });
        // URL encoded
        expect(res.redirect).toHaveBeenCalledWith(`/payment/failed?message=${encodeURIComponent('Lỗi')}`);
    });

    it('should call vnpayIPN', async () => {
        await controller.vnpayIPN({ vnp_Amount: 100 });
        expect(paymentProcessor.handleWebhook).toHaveBeenCalledWith('vnpay', { vnp_Amount: 100 });
    });

    it('should call getPayments', async () => {
        await controller.getPayments({ page: 1 } as any);
        expect(paymentManagement.getList).toHaveBeenCalledWith({ page: 1 });
    });

    it('should call getPaymentById', async () => {
        await controller.getPaymentById('1');
        expect(paymentManagement.getOne).toHaveBeenCalledWith('1');
    });
});
