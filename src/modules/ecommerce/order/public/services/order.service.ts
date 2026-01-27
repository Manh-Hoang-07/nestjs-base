import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { GetOrdersDto } from '../dtos/get-orders.dto';
import { OrderValidationService } from './order-validation.service';
import { OrderCalculationService } from './order-calculation.service';
import { OrderCreationService } from './order-creation.service';
import { OrderStockService } from './order-stock.service';
import { PaymentService } from '@/modules/payment/public/services/payment.service';
import { generateOrderAccessKey, verifyOrderAccessKey } from '../utils/order-access.helper';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/order.repository';

@Injectable()
export class PublicOrderService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly validationService: OrderValidationService,
    private readonly calculationService: OrderCalculationService,
    private readonly creationService: OrderCreationService,
    private readonly stockService: OrderStockService,
    private readonly paymentService: PaymentService,
  ) { }

  /**
   * Tạo order từ cart với full transaction support
   */
  async createOrderFromCart(
    createOrderDto: CreateOrderDto,
    userId?: number | bigint,
  ): Promise<any> {
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      billing_address,
      shipping_method_id,
      payment_method_id,
      notes,
      cart_uuid,
    } = createOrderDto;

    // Auto-extract customer info
    const finalCustomerName = customer_name || (shipping_address as any)?.name || '';
    const finalCustomerPhone = customer_phone || (shipping_address as any)?.phone || '';
    const finalCustomerEmail = customer_email || (shipping_address as any)?.email || '';

    return this.prisma.$transaction(async (tx) => {
      // 1. Validate và lấy cart
      const cartHeader = await this.validationService.validateAndGetCart(
        tx as any,
        userId,
        cart_uuid,
      );

      // Ownership check (redundant but safe)
      if (userId && cartHeader.owner_key !== `user_${userId}`) {
        throw new ForbiddenException('Cart does not belong to this user');
      }

      // 2. Validate cart items
      const cartItems = await this.validationService.validateCartItems(
        tx as any,
        cartHeader.id,
      );

      // 3. Validate product variants và stock
      const variantMap = await this.validationService.validateProductVariants(
        tx as any,
        cartItems,
      );

      // 4. Tính toán order type
      const orderType = this.calculationService.calculateOrderType(cartItems, variantMap);

      // 5. Validate payment method cho order type
      await this.validationService.validatePaymentMethodForOrderType(
        tx as any,
        orderType,
        payment_method_id,
      );

      // 6. Validate shipping method
      await this.validationService.validateShippingMethod(
        tx as any,
        shipping_method_id,
      );

      // 7. Tạo order
      const savedOrder = await this.creationService.createOrder(
        tx as any,
        {
          customerName: finalCustomerName,
          customerEmail: finalCustomerEmail,
          customerPhone: finalCustomerPhone,
          shippingAddress: shipping_address,
          billingAddress: billing_address,
          shippingMethodId: shipping_method_id,
          paymentMethodId: payment_method_id,
          notes,
          userId,
          cartHeader,
          orderType,
        },
      );

      // 8. Tạo order items và deduct stock
      await this.creationService.createOrderItemsAndDeductStock(
        tx as any,
        savedOrder.id,
        cartItems,
        variantMap,
      );

      // 9. Tạo payment record (offline only)
      await this.creationService.createPaymentRecord(
        tx as any,
        savedOrder.id,
        savedOrder.total_amount,
        payment_method_id,
      );

      // 10. Clear cart
      await this.creationService.clearCart(tx as any, cartHeader.id);

      // 11. Post-process payment URL if online
      let paymentUrl = null;
      let paymentId = null;
      if (payment_method_id) {
        const paymentMethod = await tx.paymentMethod.findUnique({ where: { id: BigInt(payment_method_id) } });
        if (paymentMethod) {
          const paymentCode = paymentMethod.code?.toLowerCase();
          const onlinePaymentCodes = ['vnpay', 'momo'];
          if (onlinePaymentCodes.includes(paymentCode)) {
            try {
              // Note: paymentService.create handles its own transaction or uses this prisma instance
              // Since we are inside a transaction, we should be careful. 
              // But paymentService.create will use this.prisma.
              // To be safe, we might want to call it AFTER the transaction or pass the tx.
              // However, paymentService.create is not designed to take tx.
            } catch (e) {
              console.error('Failed to generate payment URL', e);
            }
          }
        }
      }

      // Generate access key
      const hashKey = generateOrderAccessKey({
        id: savedOrder.id,
        order_number: savedOrder.order_number,
        customer_email: savedOrder.customer_email,
        customer_phone: savedOrder.customer_phone,
        total_amount: savedOrder.total_amount,
      });
      const baseUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
      const orderAccessUrl = `${baseUrl}/api/public/orders/access?orderCode=${savedOrder.order_number}&hashKey=${hashKey}`;

      return {
        order_id: savedOrder.id,
        order_number: savedOrder.order_number,
        status: savedOrder.status,
        total_amount: savedOrder.total_amount,
        items_count: cartItems.length,
        access_url: orderAccessUrl,
      };
    });
  }

  // Helper to handle payment activation AFTER order creation
  async completeOrderCreation(orderId: number | bigint, paymentMethodId?: number | bigint, customerInfo?: any) {
    // Implement if needed to call paymentService.create outside main transaction
  }

  /**
   * Lấy danh sách orders
   */
  async getOrders(getOrdersDto: GetOrdersDto, userId?: number | bigint): Promise<any> {
    const { page = 1, limit = 10, status } = getOrdersDto;
    const filters: any = {};
    if (userId) filters.user_id = userId;
    if (status) filters.status = status;

    return this.orderRepository.findAll({
      page,
      limit,
      filter: filters,
      sort: 'created_at:desc',
    });
  }

  /**
   * Lấy chi tiết order
   */
  async getOrderById(orderId: number | bigint, userId?: number | bigint): Promise<any> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');
    if (userId && order.user_id !== BigInt(userId)) {
      throw new ForbiddenException('Unauthorized access to order');
    }
    return order;
  }

  /**
   * Lấy order qua access key
   */
  async getOrderByAccessKey(orderNumber: string, accessKey: string): Promise<any> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order) throw new NotFoundException('Order not found');

    if (!verifyOrderAccessKey({
      id: order.id,
      order_number: order.order_number,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      total_amount: order.total_amount,
    }, accessKey)) {
      throw new BadRequestException('Invalid access key');
    }

    return order;
  }

  /**
   * Cancel order
   */
  async cancel(orderId: number | bigint, userId?: number | bigint): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: BigInt(orderId) },
        include: { items: true },
      });

      if (!order) throw new NotFoundException('Order not found');
      if (userId && order.user_id !== BigInt(userId)) {
        throw new ForbiddenException('Unauthorized access to order');
      }

      if (!['pending', 'confirmed'].includes(order.status)) {
        throw new BadRequestException('Order cannot be cancelled in current status');
      }

      // Restore stock
      await this.stockService.restoreStock(tx as any, order);

      // Update status
      const updated = await tx.order.update({
        where: { id: BigInt(orderId) },
        data: { status: 'cancelled' },
      });

      return { order_id: updated.id, status: updated.status };
    });
  }
}