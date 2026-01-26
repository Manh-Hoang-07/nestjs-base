import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '@/shared/entities/order.entity';
import { CreateOrderDto } from '@/modules/ecommerce/public/order/dtos/create-order.dto';
import { GetOrdersDto } from '@/modules/ecommerce/public/order/dtos/get-orders.dto';
import { CrudService } from '@/common/base/services/crud.service';
import { OrderStatus } from '@/shared/enums/order-status.enum';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrderValidationService } from './order-validation.service';
import { OrderCalculationService } from './order-calculation.service';
import { OrderCreationService } from './order-creation.service';
import { OrderStockService } from './order-stock.service';
import { PaymentProcessorService } from '@/modules/payment/core/services/payment-processor.service';
import { PaymentMethod } from '@/shared/entities/payment-method.entity';
import { generateOrderAccessKey, verifyOrderAccessKey } from '@/modules/ecommerce/public/order/utils/order-access.helper';

@Injectable()
export class PublicOrderService extends CrudService<Order> {
  constructor(
    @InjectRepository(Order)
    protected readonly orderRepository: Repository<Order>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly validationService: OrderValidationService,
    private readonly calculationService: OrderCalculationService,
    private readonly creationService: OrderCreationService,
    private readonly stockService: OrderStockService,
    private readonly paymentProcessor: PaymentProcessorService,
  ) {
    super(orderRepository);
  }

  /**
   * Override prepareOptions để load relations mặc định
   */
  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: ['items', 'items.variant', 'shipping_method', 'payment_method'],
    } as any;
  }

  /**
   * Tạo order từ cart với full transaction support
   */
  async createOrderFromCart(
    createOrderDto: CreateOrderDto,
    userId?: number,
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
    const finalCustomerName = customer_name || (shipping_address?.name) || '';
    const finalCustomerPhone = customer_phone || (shipping_address?.phone) || '';
    const finalCustomerEmail = customer_email || (shipping_address?.email) || '';

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validate và lấy cart
      const cartHeader = await this.validationService.validateAndGetCart(
        queryRunner.manager,
        userId,
        cart_uuid,
      );
      
      // CRITICAL: Double-check ownership để đảm bảo security
      // Nếu có userId, cart phải thuộc về user đó
      if (userId && cartHeader.owner_key !== `user_${userId}`) {
        await queryRunner.rollbackTransaction();
        throw new ForbiddenException('Cart does not belong to this user');
      }

      // 2. Validate cart items
      const cartItems = await this.validationService.validateCartItems(
        queryRunner.manager,
        cartHeader.id,
      );

      // 3. Validate product variants và stock
      const variantMap = await this.validationService.validateProductVariants(
        queryRunner.manager,
        cartItems,
      );

      // 4. Tính toán order type
      const orderType = this.calculationService.calculateOrderType(cartItems, variantMap);

      // 5. Validate payment method cho order type
      await this.validationService.validatePaymentMethodForOrderType(
        queryRunner.manager,
        orderType,
        payment_method_id,
      );

      // 6. Validate shipping method
      await this.validationService.validateShippingMethod(
        queryRunner.manager,
        shipping_method_id,
      );

      // 7. Tạo order
      const savedOrder = await this.creationService.createOrder(
        queryRunner.manager,
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
        queryRunner.manager,
        savedOrder.id,
        cartItems,
        variantMap,
      );

      // 9. Tạo payment record
      await this.creationService.createPaymentRecord(
        queryRunner.manager,
        savedOrder.id,
        savedOrder.total_amount,
        payment_method_id,
      );

      // 10. Lấy payment method info (trước khi commit transaction)
      let paymentMethod = null;
      if (payment_method_id) {
        paymentMethod = await queryRunner.manager.findOne(PaymentMethod, {
          where: { id: payment_method_id },
        });
      }

      // 11. Clear cart
      await this.creationService.clearCart(queryRunner.manager, cartHeader.id);

      // 12. Commit transaction
      await queryRunner.commitTransaction();

      // 13. Tự động tạo payment URL nếu payment method là online
      let paymentUrl = null;
      let paymentInfo = null;
      
      if (paymentMethod) {
        try {
          const paymentCode = paymentMethod.code?.toLowerCase();
          // Kiểm tra nếu là online payment gateway (vnpay, momo)
          const onlinePaymentCodes = ['vnpay', 'momo'];
          
          if (onlinePaymentCodes.includes(paymentCode)) {
            // Tự động tạo payment URL
            const paymentUrlResult = await this.paymentProcessor.create({
              order_id: savedOrder.id,
              payment_method_code: paymentCode as 'vnpay' | 'momo',
              customer_email: finalCustomerEmail,
              customer_phone: finalCustomerPhone,
              customer_name: finalCustomerName,
            });

            if (paymentUrlResult && paymentUrlResult.payment_url) {
              paymentUrl = paymentUrlResult.payment_url;
              paymentInfo = {
                payment_id: paymentUrlResult.payment_id,
                payment_method_code: paymentUrlResult.payment_method_code,
                transaction_id: paymentUrlResult.transaction_id,
              };
            }
          }
        } catch (error) {
          // Nếu tạo payment URL fail, vẫn trả về order info nhưng không có payment_url
          // Log error nhưng không throw để không làm fail việc tạo order
          console.error('Failed to create payment URL:', error);
        }
      }

      // Generate access key for order tracking (hash từ thông tin đơn hàng)
      const hashKey = generateOrderAccessKey({
        id: savedOrder.id,
        order_number: savedOrder.order_number,
        customer_email: savedOrder.customer_email,
        customer_phone: savedOrder.customer_phone,
        total_amount: savedOrder.total_amount,
      });
      const baseUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
      const orderAccessUrl = `${baseUrl}/api/public/orders/access?orderCode=${savedOrder.order_number}&hashKey=${hashKey}`;

      const response: any = {
        order_id: savedOrder.id,
        order_number: savedOrder.order_number,
        status: savedOrder.status,
        total_amount: savedOrder.total_amount,
        items_count: cartItems.length,
        access_url: orderAccessUrl,
      };

      // Thêm payment info nếu có
      if (paymentUrl) {
        response.payment_url = paymentUrl;
        response.payment = paymentInfo;
      }

      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (error instanceof BadRequestException ||
          error instanceof NotFoundException ||
          error instanceof ForbiddenException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to create order. Please try again.');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Lấy danh sách orders
   * TODO: Cần update để filter theo user_id hoặc session_token
   */
  async getOrders(
    getOrdersDto: GetOrdersDto,
    userId?: number,
  ): Promise<any> {
    const {
      cart_uuid,
      page = 1,
      limit = 10,
      status,
    } = getOrdersDto;

    // Build filters
    const filters: any = {};

    // Filter by user_id
    if (userId) {
      filters.user_id = userId;
    }

    if (status) {
      filters.status = status;
    }

    const options = {
      page,
      limit,
      sort: 'created_at:DESC'
    };

    const result = await this.getList(filters, options);

    return {
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * Lấy thông tin order bằng access key (không cần authentication)
   */
  async getOrderByAccessKey(orderNumber: string, accessKey: string): Promise<any> {
    const order = await this.orderRepository.findOne({
      where: { order_number: orderNumber },
      relations: ['items', 'shipping_method', 'payment_method', 'payments'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify access key (hash từ thông tin đơn hàng)
    if (!verifyOrderAccessKey({
      id: order.id,
      order_number: order.order_number,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      total_amount: order.total_amount,
    }, accessKey)) {
      throw new BadRequestException('Invalid access key');
    }

    return {
      order_id: order.id,
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status,
      shipping_status: order.shipping_status,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      total_amount: order.total_amount,
      currency: order.currency,
      created_at: order.created_at,
      items: order.items,
      shipping_method: order.shipping_method,
      payment_method: order.payment_method,
      payments: order.payments,
    };
  }

  /**
   * Lấy chi tiết order - sử dụng getOne từ base với relations từ prepareOptions
   * TODO: Add authorization check (verify user owns this order)
   */
  async getOrderById(orderId: number, userId?: number): Promise<any> {
    const order = await this.getOne({ id: orderId }, { relations: ['items', 'shipping_method', 'payment_method', 'payments'] });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Authorization check: verify user owns this order
    if (userId && order.user_id !== userId) {
      throw new ForbiddenException('Unauthorized access to order');
    }

    return order;
  }

  /**
   * Cancel order
   * TODO: Implement with transaction to restore stock
   */
  async cancel(orderId: number, userId?: number): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get order with lock
      const order = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .leftJoinAndSelect('order.items', 'items')
        .setLock('pessimistic_write')
        .where('order.id = :id', { id: orderId })
        .getOne();

      if (!order) {
        await queryRunner.rollbackTransaction();
        throw new NotFoundException('Order not found');
      }

      // Authorization check
      if (userId && order.user_id !== userId) {
        await queryRunner.rollbackTransaction();
        throw new ForbiddenException('Unauthorized access to order');
      }

      // Check if order can be cancelled
      if (!['pending', 'confirmed'].includes(order.status)) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException('Order cannot be cancelled in current status');
      }

      // Restore stock for each item
      await this.stockService.restoreStock(queryRunner.manager, order);

      // Update order status
      order.status = OrderStatus.CANCELLED;
      await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();

      return { order_id: order.id, status: order.status };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // Re-throw if already a NestJS exception
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to cancel order. Please try again.');
    } finally {
      await queryRunner.release();
    }
  }

}