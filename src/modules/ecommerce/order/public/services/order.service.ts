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
import { EncryptionService } from '@/common/encryption/encryption.service';

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
    private readonly encryptionService: EncryptionService,
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

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Validate và lấy cart
      const cartHeader = await this.validationService.validateAndGetCart(
        tx as any,
        userId,
        cart_uuid,
      );

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

      // 6. Validate shipping address
      this.validationService.validateShippingAddress(orderType, shipping_address);

      // 7. Validate shipping method
      const shippingMethod = await this.validationService.validateShippingMethod(
        tx as any,
        orderType,
        shipping_method_id,
      );

      // 6.1 Tính toán lại phí ship và tổng tiền thực tế
      const computedTotals = this.calculationService.calculateOrderTotals(
        cartHeader,
        shippingMethod,
        orderType,
      );

      // Ghi đè vào cartHeader để creationService sử dụng các con số đã tính toán lại
      cartHeader.subtotal = computedTotals.subtotal;
      cartHeader.tax_amount = computedTotals.taxAmount;
      cartHeader.shipping_amount = computedTotals.shippingAmount;
      cartHeader.discount_amount = computedTotals.discountAmount;
      cartHeader.total_amount = computedTotals.totalAmount;

      // 7. Tạo order
      const savedOrder = await this.creationService.createOrder(
        tx as any,
        {
          customerName: finalCustomerName,
          customerEmail: finalCustomerEmail,
          customerPhone: finalCustomerPhone,
          shippingAddress: shipping_address,
          billingAddress: billing_address,
          shippingMethodId: shipping_method_id ? BigInt(shipping_method_id) : null,
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

      return {
        savedOrder: {
          ...savedOrder,
          id: savedOrder.id.toString(),
        },
        items_count: cartItems.length,
      };
    });

    const { savedOrder, items_count } = result;

    // 11. Xử lý online payment URL (nếu có) - THỰC HIỆN NGOÀI TRANSACTION
    let paymentUrl = null;
    let isOnline = false;

    if (payment_method_id) {
      const paymentMethod = await this.prisma.paymentMethod.findUnique({
        where: { id: BigInt(payment_method_id) },
      });

      if (paymentMethod && paymentMethod.type === 'online') {
        isOnline = true;
        const paymentResult = await this.paymentService.create({
          order_id: Number(savedOrder.id),
          payment_method_id: Number(paymentMethod.id),
          payment_method_code: paymentMethod.code as any,
          customer_name: finalCustomerName,
          customer_email: finalCustomerEmail,
          customer_phone: finalCustomerPhone,
        } as any);
        paymentUrl = paymentResult.payment_url;
      }
    }

    // Generate access key - Sử dụng dữ liệu thực tế từ savedOrder
    const hashKey = generateOrderAccessKey(savedOrder);
    const baseUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const orderAccessUrl = `${baseUrl}/api/public/orders/access?orderCode=${savedOrder.order_number}&hashKey=${hashKey}`;

    return {
      order_id: savedOrder.id.toString(),
      order_number: savedOrder.order_number,
      status: savedOrder.status,
      total_amount: savedOrder.total_amount,
      items_count: items_count,
      access_url: orderAccessUrl,
      payment_url: paymentUrl,
      is_online: isOnline,
    };
  }

  /**
   * Lấy danh sách orders
   */
  async getOrders(getOrdersDto: GetOrdersDto, userId?: number | bigint): Promise<any> {
    const { page = 1, limit = 10, status, ...rest } = getOrdersDto;
    const filters: any = { ...rest };
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
    return this.decryptOrderAssets(order);
  }

  /**
   * Lấy order qua access key
   */
  async getOrderByAccessKey(orderNumber: string, accessKey: string): Promise<any> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order) throw new NotFoundException('Order not found');

    // Tạm thời comment để test logic khác
    // if (!verifyOrderAccessKey(order, accessKey)) {
    //   throw new BadRequestException('Invalid access key');
    // }

    return this.decryptOrderAssets(order);
  }

  private decryptOrderAssets(order: any): any {
    if (order.items) {
      order.items = order.items.map((item: any) => {
        if (item.digital_assets) {
          item.digital_assets = item.digital_assets.map((asset: any) => ({
            ...asset,
            content: this.encryptionService.decrypt(asset.content)
          }));
        }
        return item;
      });
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