import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Cart } from '@/shared/entities/cart.entity';
import { CartHeader } from '@/shared/entities/cart-header.entity';

@Injectable()
export class CartCalculationService {
  /**
   * Tính toán và update cart totals
   */
  async updateCartTotals(
    manager: EntityManager,
    cartHeaderId: number,
  ): Promise<void> {
    const items = await manager.find(Cart, {
      where: { cart_header_id: cartHeaderId },
      relations: ['variant'],
    });

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum, item) => sum + parseFloat(item.total_price || '0'),
      0,
    );

    // Get current cart header to preserve existing discount, tax, shipping
    const cartHeader = await manager.findOne(CartHeader, {
      where: { id: cartHeaderId },
    });

    if (!cartHeader) {
      throw new NotFoundException('Cart not found');
    }

    // Preserve existing values (tax, shipping, discount)
    const taxAmount = parseFloat(cartHeader.tax_amount) || 0;
    const shippingAmount = parseFloat(cartHeader.shipping_amount) || 0;
    const discountAmount = parseFloat(cartHeader.discount_amount) || 0;
    
    // Calculate total
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Update cart header
    await manager.update(CartHeader, cartHeaderId, {
      subtotal: subtotal.toString(),
      tax_amount: taxAmount.toString(),
      shipping_amount: shippingAmount.toString(),
      discount_amount: discountAmount.toString(),
      total_amount: totalAmount.toString(),
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
