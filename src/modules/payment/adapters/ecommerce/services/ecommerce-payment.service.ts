import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentProcessorService } from '@/modules/payment/core/services/payment-processor.service';
import { CreatePaymentUrlDto } from '@/modules/payment/adapters/ecommerce/dtos/create-payment-url.dto';
import { CreatePaymentDto } from '@/modules/payment/adapters/ecommerce/dtos/create-payment.dto';
import { GetPaymentsDto } from '@/modules/payment/adapters/ecommerce/dtos/get-payments.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '@/shared/entities/order.entity';
import { Payment } from '@/shared/entities/payment.entity';
import { OrderAutomationService } from '@/modules/ecommerce/public/order/services/order-automation.service';

@Injectable()
export class EcommercePaymentService {
  constructor(
    private readonly paymentProcessor: PaymentProcessorService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly orderAutomationService: OrderAutomationService,
  ) {}

  async createPaymentUrl(dto: CreatePaymentUrlDto) {
    return this.paymentProcessor.create(dto);
  }

  async createPayment(dto: CreatePaymentDto) {
    return this.paymentProcessor.create(dto);
  }

  async getPayments(dto: GetPaymentsDto) {
    return this.paymentProcessor.getPayments(dto);
  }

  async getPaymentById(paymentId: number) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order', 'payment_method'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async verifyPayment(gateway: string, query: any) {
    const result = await this.paymentProcessor.verifyPayment(gateway, query);

    // Nếu payment thành công, chạy automation cho đơn hàng digital/mixed
    if (result?.payment_status === 'success' || result?.payment_status === 'completed') {
      const order = await this.orderRepository.findOne({
        where: { id: result.order_id },
      });
      if (order) {
        await this.orderAutomationService.processPostPayment(order);
      }
    }

    return result;
  }

  async handleWebhook(gateway: string, payload: any) {
    const response = await this.paymentProcessor.handleWebhook(gateway, payload);

    // Nếu webhook báo thành công, tìm đơn và chạy automation
    if (response?.data?.success && response.data.orderId) {
      const order = await this.orderRepository.findOne({
        where: { order_number: response.data.orderId },
      });
      if (order) {
        await this.orderAutomationService.processPostPayment(order);
      }
    }

    return response;
  }
}


