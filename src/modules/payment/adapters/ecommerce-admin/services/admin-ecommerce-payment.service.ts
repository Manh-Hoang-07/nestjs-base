import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '@/shared/entities/payment.entity';
import { Order } from '@/shared/entities/order.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { UpdatePaymentDto } from '../dtos/update-payment.dto';
import { PaymentStatus } from '@/shared/enums/payment-status.enum';
import { OrderStatus } from '@/shared/enums/order-status.enum';
import { OrderType } from '@/shared/enums/order-type.enum';
import { ShippingStatus } from '@/shared/enums/shipping-status.enum';
import { OrderAutomationService } from '@/modules/ecommerce/public/order/services/order-automation.service';

type PaymentStatusType =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

@Injectable()
export class AdminEcommercePaymentService extends CrudService<Payment> {
  // Define valid status transitions
  private readonly validTransitions: Record<
    PaymentStatusType,
    PaymentStatusType[]
  > = {
    pending: ['processing', 'completed', 'failed'],
    processing: ['completed', 'failed'],
    completed: ['refunded'], // Can only refund from completed
    failed: ['pending', 'processing'], // Can retry from failed
    refunded: [], // Final state, cannot transition
  };

  constructor(
    @InjectRepository(Payment)
    protected readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly orderAutomationService: OrderAutomationService,
  ) {
    super(paymentRepository);
  }

  /**
   * Validate if status transition is allowed
   */
  private validateStatusTransition(
    oldStatus: PaymentStatusType,
    newStatus: PaymentStatusType,
  ): void {
    if (oldStatus === newStatus) {
      return; // No change, allow
    }

    const allowedTransitions = this.validTransitions[oldStatus];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition payment status from '${oldStatus}' to '${newStatus}'. Allowed transitions: ${allowedTransitions.join(', ')}`,
      );
    }
  }

  /**
   * Override prepareOptions để load relations mặc định
   */
  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: ['order', 'payment_method'],
    } as any;
  }

  /**
   * Update payment status và tự động cập nhật order
   */
  async updatePaymentStatus(
    paymentId: number,
    updateDto: UpdatePaymentDto,
  ): Promise<Payment> {
    // Get payment with order
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const oldStatus = payment.status as PaymentStatusType;
    const newStatus = (updateDto.status || payment.status) as PaymentStatusType;

    // Validate status transition
    if (updateDto.status && updateDto.status !== oldStatus) {
      this.validateStatusTransition(oldStatus, newStatus);
    }

    // Prepare update data
    const updateData: any = {
      status: newStatus,
    };

    if (updateDto.paid_at) {
      updateData.paid_at = new Date(updateDto.paid_at);
    }

    if (updateDto.refunded_at) {
      updateData.refunded_at = new Date(updateDto.refunded_at);
    }

    if (updateDto.notes !== undefined) {
      updateData.notes = updateDto.notes;
    }

    // Use transaction for consistency
    let shouldTriggerAutomation = false;
    let orderForAutomation: Order | null = null;

    await this.paymentRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Update payment
        await transactionalEntityManager.update(Payment, paymentId, updateData);

        // ⭐ CẢI THIỆN: Tự động cập nhật order khi payment completed
        // Logic này xử lý cả online payment (đã auto-confirm) và offline payment (COD/Bank Transfer)
        // Khi admin xác nhận offline payment, order sẽ được chuyển sang CONFIRMED
        if (newStatus === 'completed' && oldStatus !== 'completed') {
          const order = payment.order;

          const orderUpdateData: any = {
            payment_status: PaymentStatus.PAID,
          };

          // ⭐ CẢI THIỆN: Phân biệt logic theo payment type
          // - Online payment (vnpay, momo): Đã được auto-confirm trong processPaymentResult
          // - Offline payment (cod, bank_transfer): Chờ admin xác nhận, sau đó confirm ở đây
          const isOfflinePayment = payment.payment_method_type === 'offline' || 
            payment.payment_method_code === 'cod' || 
            payment.payment_method_code === 'bank_transfer';
          
          // Nếu order là pending, chuyển sang confirmed
          // Với offline payment, đây là lúc admin xác nhận nên cần confirm
          // Với online payment, có thể đã được confirm rồi, nhưng update lại cũng không sao
          if (order.status === OrderStatus.PENDING) {
            orderUpdateData.status = OrderStatus.CONFIRMED;
          }

          await transactionalEntityManager.update(
            Order,
            order.id,
            orderUpdateData,
          );

          // Nếu là digital order, tự động delivered
          if (order.order_type === OrderType.DIGITAL) {
            await transactionalEntityManager.update(Order, order.id, {
              status: OrderStatus.DELIVERED,
              shipping_status: ShippingStatus.DELIVERED,
              delivered_at: new Date(),
            });
          }

          // ⭐ FIX: Trigger automation cho digital/mixed orders sau khi transaction commit
          // Lưu order để trigger automation sau transaction
          if (order.order_type === OrderType.DIGITAL || order.order_type === OrderType.MIXED) {
            shouldTriggerAutomation = true;
            // Reload order với fresh data sau khi update
            const updatedOrder = await transactionalEntityManager.findOne(Order, {
              where: { id: order.id },
            });
            orderForAutomation = updatedOrder;
          }
        }

        // Tự động cập nhật order khi payment failed
        if (newStatus === 'failed' && oldStatus !== 'failed') {
          const order = payment.order;

          await transactionalEntityManager.update(Order, order.id, {
            payment_status: PaymentStatus.FAILED,
          });
        }

        // Tự động cập nhật order khi payment refunded
        if (newStatus === 'refunded' && oldStatus !== 'refunded') {
          const order = payment.order;

          await transactionalEntityManager.update(Order, order.id, {
            payment_status: PaymentStatus.REFUNDED,
          });
        }
      },
    );

    // ⭐ FIX: Trigger automation sau khi transaction commit thành công
    // Automation không nên nằm trong transaction vì có thể tốn thời gian (gửi email, etc.)
    if (shouldTriggerAutomation && orderForAutomation) {
      try {
        await this.orderAutomationService.processPostPayment(orderForAutomation);
      } catch (error) {
        // Log error nhưng không throw để không ảnh hưởng đến payment update
        // Removed console.error for production
      }
    }

    // Return updated payment
    const updated = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order', 'payment_method'],
    });

    if (!updated) {
      throw new NotFoundException('Payment not found');
    }

    return updated;
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: number): Promise<Payment> {
    const payment = await this.getOne(
      { id: paymentId },
      { relations: ['order', 'payment_method'] },
    );

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}


