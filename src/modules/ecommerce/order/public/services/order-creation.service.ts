import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Order } from '@/shared/entities/order.entity';
import { OrderItem } from '@/shared/entities/order-item.entity';
import { Cart } from '@/shared/entities/cart.entity';
import { CartHeader } from '@/shared/entities/cart-header.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { Payment } from '@/shared/entities/payment.entity';
import { PaymentMethod } from '@/shared/entities/payment-method.entity';
import { OrderStatus } from '@/shared/enums/order-status.enum';
import { OrderType } from '@/shared/enums/order-type.enum';
import { PaymentType } from '@/shared/enums/payment-type.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderCreationService {
  /**
   * Generate unique order number
   */
  generateOrderNumber(): string {
    return `ORD-${uuidv4()}`;
  }

  /**
   * Tạo order entity
   */
  async createOrder(
    manager: EntityManager,
    data: {
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      shippingAddress: any;
      billingAddress?: any;
      shippingMethodId: number;
      paymentMethodId?: number;
      notes?: string;
      userId?: number;
      cartHeader: CartHeader;
      orderType: OrderType;
    },
  ): Promise<Order> {
    const order = manager.create(Order, {
      order_number: this.generateOrderNumber(),
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      status: OrderStatus.PENDING,
      order_type: data.orderType,
      currency: data.cartHeader.currency,
      subtotal: data.cartHeader.subtotal,
      tax_amount: data.cartHeader.tax_amount,
      shipping_amount: data.cartHeader.shipping_amount,
      discount_amount: data.cartHeader.discount_amount,
      total_amount: data.cartHeader.total_amount,
      shipping_address: JSON.stringify(data.shippingAddress),
      billing_address: data.billingAddress
        ? JSON.stringify(data.billingAddress)
        : JSON.stringify(data.shippingAddress),
      shipping_method_id: data.shippingMethodId,
      payment_method_id: data.paymentMethodId || null,
      notes: data.notes || null,
      user_id: data.userId || null,
      session_token: null,
    });

    const savedOrder = await manager.save(Order, order);
    return savedOrder;
  }

  /**
   * Tạo order items và deduct stock
   * Sử dụng atomic decrement() để đảm bảo stock deduction an toàn
   */
  async createOrderItemsAndDeductStock(
    manager: EntityManager,
    orderId: number,
    cartItems: Cart[],
    variantMap: Map<number, ProductVariant>,
  ): Promise<void> {
    // 1. Tạo tất cả order items trước
    const orderItems = cartItems.map(cartItem =>
      manager.create(OrderItem, {
        order_id: orderId,
        product_id: cartItem.product_id,
        product_variant_id: cartItem.product_variant_id,
        product_name: cartItem.product_name,
        product_sku: cartItem.product_sku,
        variant_name: cartItem.variant_name,
        quantity: cartItem.quantity,
        unit_price: cartItem.unit_price,
        total_price: cartItem.total_price,
        product_attributes: cartItem.product_attributes,
      }),
    );

    // Batch save order items
    await manager.save(OrderItem, orderItems);

    // 2. Deduct stock atomically cho tất cả variants
    for (const cartItem of cartItems) {
      if (cartItem.product_variant_id) {
        const variantId = cartItem.product_variant_id as number;
        // Sử dụng atomic decrement để đảm bảo thread-safe
        await manager.decrement(
          ProductVariant,
          { id: variantId },
          'stock_quantity',
          cartItem.quantity,
        );
      }
    }
  }

  /**
   * Tạo payment record cho COD và Bank Transfer
   * Chỉ tạo cho offline payment methods (COD, Bank Transfer)
   * Online payments sẽ được tạo trong createPaymentUrl()
   */
  async createPaymentRecord(
    manager: EntityManager,
    orderId: number,
    totalAmount: string,
    paymentMethodId?: number,
  ): Promise<void> {
    if (!paymentMethodId) return;

    const paymentMethod = await manager.findOne(PaymentMethod, {
      where: { id: paymentMethodId },
    });

    if (!paymentMethod) return;

    const paymentCode = paymentMethod.code?.toLowerCase();
    
    // Chỉ tạo payment record cho offline payment methods (COD, Bank Transfer)
    // Online payments (vnpay, momo) sẽ được tạo trong createPaymentUrl()
    if (paymentCode === 'cod' || paymentCode === 'bank_transfer') {
      // Kiểm tra xem payment record đã tồn tại chưa để tránh duplicate
      const existingPayment = await manager.findOne(Payment, {
        where: {
          order_id: orderId,
          payment_method_id: paymentMethodId,
        },
      });

      // Chỉ tạo nếu chưa tồn tại
      if (!existingPayment) {
        const payment = manager.create(Payment, {
          order_id: orderId,
          payment_method_id: paymentMethodId,
          amount: totalAmount,
          payment_method_code: paymentCode || paymentMethod.code,
          payment_method_type: paymentMethod.type || PaymentType.OFFLINE,
          status: 'pending',
          transaction_id: null,
          paid_at: null,
        } as any);
        
        await manager.save(Payment, payment);
      }
    }
  }

  /**
   * Clear cart sau khi tạo order thành công
   */
  async clearCart(
    manager: EntityManager,
    cartHeaderId: number,
  ): Promise<void> {
    await manager.delete(Cart, {
      cart_header_id: cartHeaderId,
    });

    await manager.delete(CartHeader, {
      id: cartHeaderId,
    });
  }
}
