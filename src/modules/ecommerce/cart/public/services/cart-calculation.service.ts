import { Injectable, NotFoundException } from '@nestjs/common';
import { Cart, CartHeader } from '@prisma/client';

@Injectable()
export class CartCalculationService {
  /**
   * Tính toán và update cart totals
   */
  async updateCartTotals(
    prisma: any,
    cartHeaderId: number | bigint,
  ): Promise<void> {
    const items = await prisma.cart.findMany({
      where: { cart_header_id: BigInt(cartHeaderId) },
    });

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum: number, item: Cart) => sum + Number(item.total_price || 0),
      0,
    );

    // Get current cart header to preserve existing discount, tax, shipping
    const cartHeader = await prisma.cartHeader.findUnique({
      where: { id: BigInt(cartHeaderId) },
    });

    if (!cartHeader) {
      throw new NotFoundException('Cart not found');
    }

    // Preserve existing values (tax, shipping, discount)
    const taxAmount = Number(cartHeader.tax_amount) || 0;
    const shippingAmount = Number(cartHeader.shipping_amount) || 0;
    const discountAmount = Number(cartHeader.discount_amount) || 0;

    // Calculate total
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Update cart header
    await prisma.cartHeader.update({
      where: { id: BigInt(cartHeaderId) },
      data: {
        subtotal: subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
      }
    });
  }

  /**
   * Tính toán total với discount
   */
  calculateTotalWithDiscount(
    subtotal: number,
    taxAmount: number,
    shippingAmount: number,
    discountAmount: number,
  ): number {
    return subtotal + taxAmount + shippingAmount - discountAmount;
  }
}
