import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '@/modules/payment/public/services/payment.service';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PAYMENT_REPOSITORY } from '@/modules/payment/domain/payment.repository';
import { PAYMENT_METHOD_REPOSITORY } from '@/modules/payment-method/domain/payment-method.repository';
import { ORDER_REPOSITORY } from '@/modules/ecommerce/order/domain/order.repository';
import { PaymentGatewayService } from '@/modules/payment/shared/payment-gateway.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PaymentService', () => {
    let service: PaymentService;
    let orderRepository: any;
    let paymentMethodRepository: any;
    let paymentGatewayService: any;
    let paymentRepository: any;
    let prismaService: any;

    beforeEach(async () => {
        orderRepository = {
            findById: jest.fn(),
            update: jest.fn(),
        };
        paymentMethodRepository = {
            findByCode: jest.fn(),
            findById: jest.fn(),
        };
        paymentGatewayService = {
            getGateway: jest.fn(),
        };
        paymentRepository = {
            create: jest.fn(),
        };
        prismaService = {
            $transaction: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentService,
                { provide: PrismaService, useValue: prismaService },
                { provide: PAYMENT_REPOSITORY, useValue: paymentRepository },
                { provide: PAYMENT_METHOD_REPOSITORY, useValue: paymentMethodRepository },
                { provide: ORDER_REPOSITORY, useValue: orderRepository },
                { provide: PaymentGatewayService, useValue: paymentGatewayService },
            ],
        }).compile();

        service = module.get<PaymentService>(PaymentService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should throw NotFoundException if order does not exist', async () => {
            orderRepository.findById.mockResolvedValue(null);
            await expect(service.create({ order_id: 1 } as any)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if order is already completed', async () => {
            orderRepository.findById.mockResolvedValue({ payment_status: 'completed' });
            await expect(service.create({ order_id: 1 } as any)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if payment method is not valid', async () => {
            orderRepository.findById.mockResolvedValue({ payment_status: 'pending' });
            paymentMethodRepository.findByCode.mockResolvedValue(null);
            await expect(service.create({ order_id: '1', payment_method_code: 'INVALID' } as any))
                .rejects.toThrow(BadRequestException);
        });

        it('should call createOnlinePayment if method type is online', async () => {
            const dto = { order_id: '1', payment_method_code: 'VNPAY', bank_code: 'VNPAY', clientIp: '127.0.0.1' };
            const order = { id: 1, order_number: 'ORD123', total_amount: 100000, payment_status: 'pending' };
            const method = { id: 1, code: 'VNPAY', type: 'online' };

            orderRepository.findById.mockResolvedValue(order);
            paymentMethodRepository.findByCode.mockResolvedValue(method);

            const gatewayMock = {
                create: jest.fn().mockResolvedValue({ success: true, paymentUrl: 'http://test.com', transactionId: 'TX123' }),
            };
            paymentGatewayService.getGateway.mockReturnValue(gatewayMock);
            paymentRepository.create.mockResolvedValue({ id: 1n });

            const result = await service.create(dto as any);

            expect(result).toEqual({
                payment_id: '1',
                payment_url: 'http://test.com',
                order_number: 'ORD123',
            });
            expect(gatewayMock.create).toHaveBeenCalled();
            expect(paymentRepository.create).toHaveBeenCalled();
        });

        it('should call createOfflinePayment if method type is offline', async () => {
            const dto = { order_id: '1', payment_method_code: 'COD', notes: 'Call me' };
            const order = { id: 1, total_amount: 100000, payment_status: 'pending' };
            const method = { id: 1, code: 'COD', type: 'offline' };

            orderRepository.findById.mockResolvedValue(order);
            paymentMethodRepository.findByCode.mockResolvedValue(method);

            prismaService.$transaction.mockImplementation(async (cb: any) => {
                return cb({
                    payment: { create: jest.fn().mockResolvedValue({ id: 1n, status: 'pending' }) },
                    order: { update: jest.fn() }
                });
            });

            const result = await service.create(dto as any);

            expect(result).toEqual({ payment_id: '1', status: 'pending' });
            expect(prismaService.$transaction).toHaveBeenCalled();
        });
    });
});
