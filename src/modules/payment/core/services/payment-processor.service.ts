import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Payment } from '@/shared/entities/payment.entity';
import { Order } from '@/shared/entities/order.entity';
import { PaymentMethod } from '@/shared/entities/payment-method.entity';
import { CreatePaymentUrlDto } from '@/modules/payment/adapters/ecommerce/dtos/create-payment-url.dto';
import { CreatePaymentDto } from '@/modules/payment/adapters/ecommerce/dtos/create-payment.dto';
import { GetPaymentsDto } from '@/modules/payment/adapters/ecommerce/dtos/get-payments.dto';
import { PaymentStatus } from '@/shared/enums/payment-status.enum';
import { OrderStatus } from '@/shared/enums/order-status.enum';
import { PaymentType } from '@/shared/enums/payment-type.enum';
import { PaymentGatewayService } from './payment-gateway.service';
import { createPaginatedResult } from '@/common/base/utils/pagination.helper';

@Injectable()
export class PaymentProcessorService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

  /**
   * Create payment - supports both online (with payment URL) and offline payments
   */
  async create(dto: CreatePaymentUrlDto | CreatePaymentDto): Promise<any> {
    const order = await this.orderRepository.findOne({ where: { id: dto.order_id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.payment_status === PaymentStatus.PAID) {
      throw new BadRequestException('Order already paid');
    }

    // Get payment method from database
    let paymentMethod: PaymentMethod | null = null;
    if ('payment_method_code' in dto && dto.payment_method_code) {
      // Case: CreatePaymentUrlDto - find by code
      paymentMethod = await this.paymentMethodRepository.findOne({
        where: { code: dto.payment_method_code },
      });
      if (!paymentMethod) {
        throw new NotFoundException(`Payment method with code "${dto.payment_method_code}" not found`);
      }
    } else if ('payment_method_id' in dto && dto.payment_method_id) {
      // Case: CreatePaymentDto - find by id
      paymentMethod = await this.paymentMethodRepository.findOne({
        where: { id: dto.payment_method_id },
      });
      if (!paymentMethod) {
        throw new NotFoundException(`Payment method with id "${dto.payment_method_id}" not found`);
      }
    } else {
      throw new BadRequestException('Payment method code or id is required');
    }

    if (!paymentMethod) {
      throw new BadRequestException('Payment method not found');
    }

    // Check payment method type to determine online or offline
    const isOnline = paymentMethod.type === PaymentType.ONLINE;

    if (isOnline) {
      return this.createOnlinePayment(dto as CreatePaymentUrlDto, order, paymentMethod);
    }
    return this.createOfflinePayment(dto as CreatePaymentDto, order, paymentMethod);
  }

  /**
   * Create online payment with payment URL
   */
  private async createOnlinePayment(
    dto: CreatePaymentUrlDto,
    order: Order,
    paymentMethod: PaymentMethod,
  ): Promise<any> {
    const { payment_method_code, customer_email, customer_phone, customer_name } = dto;
    const methodCode = payment_method_code || paymentMethod.code;

    const gateway = this.paymentGatewayService.getGateway(methodCode);
    const paymentResponse = await gateway.create({
      orderId: order.order_number,
      amount: parseFloat(order.total_amount),
      currency: order.currency || 'VND',
      description: `Thanh toan don hang ${order.order_number}`,
      customerEmail: customer_email || order.customer_email,
      customerPhone: customer_phone || order.customer_phone,
      customerName: customer_name || order.customer_name,
    });

    if (!paymentResponse.success) {
      throw new BadRequestException(
        paymentResponse.error || 'Failed to create payment',
      );
    }

    const existingPayment = await this.paymentRepository.findOne({
      where: { order_id: order.id, payment_method_code: methodCode },
    });

    let payment: Payment;
    if (existingPayment) {
      if (paymentResponse.transactionId && !existingPayment.transaction_id) {
        await this.paymentRepository.update(existingPayment.id, { transaction_id: paymentResponse.transactionId });
      }
      payment = existingPayment;
    } else {
      payment = await this.paymentRepository.save({
        order_id: order.id,
        payment_method_id: paymentMethod.id,
        amount: order.total_amount,
        payment_method_code: methodCode,
        payment_method_type: PaymentType.ONLINE,
        status: 'pending',
        transaction_id: paymentResponse.transactionId || null,
      } as any);
    }

    return {
      payment_id: payment.id,
      payment_url: paymentResponse.paymentUrl,
      order_id: order.id,
      order_number: order.order_number,
      amount: order.total_amount,
      payment_method_code: methodCode,
      transaction_id: paymentResponse.transactionId || null,
    };
  }

  /**
   * Create offline payment (COD, manual bank transfer, etc.)
   */
  private async createOfflinePayment(
    dto: CreatePaymentDto,
    order: Order,
    paymentMethod: PaymentMethod,
  ): Promise<any> {
    const { payment_method_id, transaction_id, payment_method_code, notes } = dto;

      return await this.paymentRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const payment = await transactionalEntityManager.save(Payment, {
          order_id: order.id,
          payment_method_id: paymentMethod.id,
          amount: order.total_amount,
          payment_method_type: PaymentType.OFFLINE,
          status: 'pending',
          transaction_id,
          payment_method_code: payment_method_code || paymentMethod.code,
          notes,
        } as any);

        await transactionalEntityManager.update(Order, order.id, {
          payment_status: PaymentStatus.PENDING,
        } as any);

        return {
          payment_id: payment.id,
          order_id: payment.order_id,
          amount: payment.amount,
          status: payment.status,
        };
      },
    );
  }

  /**
   * Common logic to process payment success/failure
   */
  private async processPaymentResult(
    order: Order,
    gateway: string,
    transactionId: string,
    isSuccess: boolean,
    amount: number,
    message?: string,
  ): Promise<any> {
    const expectedAmount = parseFloat(order.total_amount);
    if (Math.abs(expectedAmount - amount) > 0.01) {
      throw new BadRequestException('Payment amount mismatch');
    }

    const existingPayment = await this.paymentRepository.findOne({
      where: {
        order_id: order.id,
        transaction_id: transactionId,
      },
    });

    if (existingPayment && existingPayment.status === 'completed' && isSuccess) {
      return {
        order_id: order.id,
        order_number: order.order_number,
        payment_status: 'success',
        amount: amount,
        message: message || 'Payment already processed',
      };
    }

    return await this.paymentRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const paymentUpdateData: any = {
          status: isSuccess ? 'completed' : 'failed',
          paid_at: isSuccess ? new Date() : null,
        };

        let payment;
        if (!existingPayment) {
          const newPayment = transactionalEntityManager.create(Payment, {
            order_id: order.id,
            payment_method_id: order.payment_method_id,
            amount: order.total_amount,
            payment_method_code: gateway,
            payment_method_type: PaymentType.ONLINE,
            transaction_id: transactionId,
            ...paymentUpdateData,
          } as any);
          payment = await transactionalEntityManager.save(Payment, newPayment);
        } else {
          await transactionalEntityManager.update(
            Payment,
            existingPayment.id,
            paymentUpdateData,
          );
          payment = existingPayment;
        }

        const updateData: any = {
          payment_status: isSuccess ? PaymentStatus.PAID : PaymentStatus.FAILED,
        };

        if (isSuccess && (gateway === 'vnpay' || gateway === 'momo')) {
          updateData.status = OrderStatus.CONFIRMED;
        }

        await transactionalEntityManager.update(Order, order.id, updateData);

        return {
          order_id: order.id,
          order_number: order.order_number,
          payment_status: isSuccess ? 'success' : 'failed',
          amount: amount,
          message: message || (isSuccess ? 'Payment successful' : 'Payment failed'),
        };
      },
    );
  }

  /**
   * Verify payment from gateway callback
   */
  async verifyPayment(gateway: string, queryParams: any): Promise<any> {
    if (!this.paymentGatewayService.isSupported(gateway)) {
      throw new BadRequestException('Payment gateway not supported');
    }

    const paymentGateway = this.paymentGatewayService.getGateway(gateway);
    const transactionId = gateway === 'vnpay' 
      ? queryParams.vnp_TxnRef 
      : (queryParams.orderId || queryParams.vnp_TxnRef);

    if (!transactionId) {
      throw new BadRequestException('Missing transaction ID');
    }

    const verifyResponse = await paymentGateway.verify({ transactionId, queryParams });

    if (!verifyResponse.success) {
      throw new BadRequestException(verifyResponse.message || 'Payment verification failed');
    }

    const order = await this.orderRepository.findOne({
      where: { order_number: verifyResponse.transactionId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Kiểm tra nếu order đã được thanh toán rồi
    if (order.payment_status === PaymentStatus.PAID) {
      // Kiểm tra xem có payment record chưa
      const existingPayment = await this.paymentRepository.findOne({
        where: {
          order_id: order.id,
          transaction_id: verifyResponse.transactionId,
        },
      });

      return {
        order_id: order.id,
        order_number: order.order_number,
        payment_status: 'success',
        amount: parseFloat(order.total_amount),
        message: 'Order already paid. Payment was processed previously.',
        already_processed: true,
      };
    }

    // Kiểm tra nếu payment đã completed
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        order_id: order.id,
        transaction_id: verifyResponse.transactionId,
      },
    });

    if (existingPayment && existingPayment.status === 'completed' && verifyResponse.status === 'success') {
      return {
        order_id: order.id,
        order_number: order.order_number,
        payment_status: 'success',
        amount: parseFloat(order.total_amount),
        message: 'Payment already processed successfully.',
        already_processed: true,
      };
    }
    
    const result = await this.processPaymentResult(
      order,
      gateway,
      verifyResponse.transactionId,
      verifyResponse.status === 'success',
      verifyResponse.amount,
      verifyResponse.message,
    );

    return result;
  }

  /**
   * Handle payment webhook/IPN
   */
  async handleWebhook(gateway: string, payload: any): Promise<any> {
    try {
      if (!this.paymentGatewayService.isSupported(gateway)) {
        return { success: false, message: 'Gateway not supported' };
      }

      const paymentGateway = this.paymentGatewayService.getGateway(gateway);
      const webhookResponse = await paymentGateway.webhook(payload);

      if (webhookResponse.data?.success) {
        const orderId = webhookResponse.data.orderId;
        const amount = webhookResponse.data.amount || 0;

        const order = await this.orderRepository.findOne({
          where: { order_number: orderId },
        });

        if (order) {
          await this.processPaymentResult(
            order,
            gateway,
            orderId,
            true,
            amount,
            webhookResponse.Message || 'Payment successful via webhook',
          );
        }
      }

      return webhookResponse;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }


  /**
   * Get list of payments with filters
   */
  async getPayments(getPaymentsDto: GetPaymentsDto): Promise<any> {
    const { cart_uuid, page = 1, limit = 10, status } = getPaymentsDto;

    if (cart_uuid) {
      return createPaginatedResult([], page, limit, 0);
    }

    const whereCondition: any = {};

    if (status) {
      whereCondition.status = status as any;
    }

    const [data, total] = await this.paymentRepository.findAndCount({
      where: whereCondition,
      relations: ['order', 'payment_method'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return createPaginatedResult(data, page, limit, total);
  }
}


