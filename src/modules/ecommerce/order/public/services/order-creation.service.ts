import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class OrderCreationService {
  /**
   * Generate unique order number
   */
  generateOrderNumber(): string {
    return `ORD-${randomUUID().substring(0, 8).toUpperCase()}`;
  }

  /**
   * Tạo order entity
   */
  async createOrder(
    tx: Prisma.TransactionClient,
    data: {
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      shippingAddress: any;
      billingAddress?: any;
      shippingMethodId: number | bigint;
      paymentMethodId?: number | bigint;
      notes?: string;
      userId?: number | bigint;
      cartHeader: any;
      orderType: string;
    },
  ): Promise<any> {
    const orderData: Prisma.OrderCreateInput = {
      order_number: this.generateOrderNumber(),
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      status: 'pending',
      order_type: data.orderType as any,
      currency: data.cartHeader.currency,
      subtotal: data.cartHeader.subtotal,
      tax_amount: data.cartHeader.tax_amount,
      shipping_amount: data.cartHeader.shipping_amount || 0,
      discount_amount: data.cartHeader.discount_amount || 0,
      total_amount: data.cartHeader.total_amount,
      shipping_address: JSON.stringify(data.shippingAddress),
      billing_address: data.billingAddress
        ? JSON.stringify(data.billingAddress)
        : JSON.stringify(data.shippingAddress),
      shipping_method: { connect: { id: BigInt(data.shippingMethodId) } },
      payment_method: data.paymentMethodId ? { connect: { id: BigInt(data.paymentMethodId) } } : undefined,
      notes: data.notes || null,
      user_id: data.userId ? BigInt(data.userId) : null,
      session_token: null,
    };

    return tx.order.create({ data: orderData });
  }

  /**
   * Tạo order items và deduct stock
   */
  async createOrderItemsAndDeductStock(
    tx: Prisma.TransactionClient,
    orderId: number | bigint,
    cartItems: any[],
    variantMap: Map<number | bigint, any>,
  ): Promise<void> {
    // 1. Tạo tất cả order items
    const orderItemsData = cartItems.map(cartItem => ({
      order_id: BigInt(orderId),
      product_id: BigInt(cartItem.product_id),
      product_variant_id: cartItem.product_variant_id ? BigInt(cartItem.product_variant_id) : null,
      product_name: cartItem.product_name,
      product_sku: cartItem.product_sku,
      variant_name: cartItem.variant_name,
      quantity: cartItem.quantity,
      unit_price: cartItem.unit_price,
      total_price: cartItem.total_price,
      product_attributes: cartItem.product_attributes ? JSON.stringify(cartItem.product_attributes) : null,
    }));

    await tx.orderItem.createMany({ data: orderItemsData });

    // 2. Deduct stock atomically cho tất cả variants
    for (const cartItem of cartItems) {
      if (cartItem.product_variant_id) {
        const variantId = BigInt(cartItem.product_variant_id);
        await tx.productVariant.update({
          where: { id: variantId },
          data: {
            stock_quantity: { decrement: cartItem.quantity },
          },
        });
      }
    }
  }

  /**
   * Tạo payment record cho COD và Bank Transfer
   */
  async createPaymentRecord(
    tx: Prisma.TransactionClient,
    orderId: number | bigint,
    totalAmount: any,
    paymentMethodId?: number | bigint,
  ): Promise<void> {
    if (!paymentMethodId) return;

    const paymentMethod = await tx.paymentMethod.findUnique({
      where: { id: BigInt(paymentMethodId) },
    });

    if (!paymentMethod) return;

    const paymentCode = paymentMethod.code?.toLowerCase();

    // Chỉ tạo payment record cho offline payment methods (COD, Bank Transfer)
    if (paymentCode === 'cod' || paymentCode === 'bank_transfer') {
      const existingPayment = await tx.payment.findFirst({
        where: {
          order_id: BigInt(orderId),
          payment_method_id: BigInt(paymentMethodId),
        },
      });

      if (!existingPayment) {
        await tx.payment.create({
          data: {
            order_id: BigInt(orderId),
            payment_method_id: BigInt(paymentMethodId),
            amount: totalAmount,
            payment_method_code: paymentCode || paymentMethod.code,
            payment_method_type: paymentMethod.type || 'offline',
            status: 'pending',
            transaction_id: null,
            paid_at: null,
          } as any,
        });
      }
    }
  }

  /**
   * Clear cart sau khi tạo order thành công
   */
  async clearCart(
    tx: Prisma.TransactionClient,
    cartHeaderId: number | bigint,
  ): Promise<void> {
    await tx.cart.deleteMany({
      where: { cart_header_id: BigInt(cartHeaderId) },
    });

    await tx.cartHeader.delete({
      where: { id: BigInt(cartHeaderId) },
    });
  }
}
