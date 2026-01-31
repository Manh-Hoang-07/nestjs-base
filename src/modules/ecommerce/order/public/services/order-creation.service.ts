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
    const orderData: any = {
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
      shipping_method: data.shippingMethodId
        ? { connect: { id: BigInt(data.shippingMethodId) } }
        : undefined,
      payment_method: data.paymentMethodId
        ? { connect: { id: BigInt(data.paymentMethodId) } }
        : undefined,
      notes: data.notes || null,
      user: data.userId
        ? { connect: { id: BigInt(data.userId) } }
        : undefined,
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
    // 0. Get order details to know group_id
    const order = await tx.order.findUnique({
      where: { id: BigInt(orderId) },
      select: { group_id: true }
    });

    // 1. Tạo tất cả order items (Batch create is better but here we also need to deduct stock)
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
      product_attributes: cartItem.product_attributes || null,
    }));

    await tx.orderItem.createMany({ data: orderItemsData });

    // 2. Find default warehouse for deduction
    const warehouse = await tx.warehouse.findFirst({
      where: {
        group_id: order?.group_id ? BigInt(order.group_id) : null,
        status: 'active'
      },
      orderBy: { priority: 'desc' }
    });

    // 3. Deduct stock atomically cho tất cả variants
    for (const cartItem of cartItems) {
      if (cartItem.product_variant_id) {
        const variantId = BigInt(cartItem.product_variant_id);
        const quantity = Number(cartItem.quantity);

        // Update Variant total stock
        await tx.productVariant.update({
          where: { id: variantId },
          data: {
            stock_quantity: { decrement: quantity },
          },
        });

        // Update Warehouse inventory
        if (warehouse) {
          const where = {
            warehouse_id_product_id_product_variant_id: {
              warehouse_id: warehouse.id,
              product_id: BigInt(cartItem.product_id),
              product_variant_id: variantId
            }
          };

          const existing = await tx.warehouseInventory.findUnique({ where });
          if (existing) {
            await tx.warehouseInventory.update({
              where: { id: existing.id },
              data: { quantity: { decrement: quantity } }
            });
          }
        }
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
