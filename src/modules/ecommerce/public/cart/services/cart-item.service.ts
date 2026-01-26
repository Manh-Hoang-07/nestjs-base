import { Injectable, BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Cart } from '@/shared/entities/cart.entity';
import { CartHeader } from '@/shared/entities/cart-header.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';

@Injectable()
export class CartItemService {
  /**
   * Tính effective price (sale_price hoặc price)
   */
  calculateEffectivePrice(variant: ProductVariant): number {
    return variant.sale_price
      ? parseFloat(variant.sale_price)
      : parseFloat(variant.price);
  }

  /**
   * Tìm existing cart item với pessimistic lock để tránh race condition
   */
  async findExistingCartItem(
    manager: EntityManager,
    cartHeaderId: number,
    productVariantId: number,
  ): Promise<Cart | null> {
    return await manager
      .createQueryBuilder(Cart, 'cart')
      .setLock('pessimistic_write')
      .where('cart.cart_header_id = :cartHeaderId', { cartHeaderId })
      .andWhere('cart.product_variant_id = :productVariantId', { productVariantId })
      .getOne();
  }

  /**
   * Tạo hoặc update cart item
   */
  async createOrUpdateCartItem(
    manager: EntityManager,
    cartHeader: CartHeader,
    variant: ProductVariant,
    quantity: number,
  ): Promise<void> {
    const existingItem = await this.findExistingCartItem(
      manager,
      cartHeader.id,
      variant.id,
    );

    const finalQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    const effectivePrice = this.calculateEffectivePrice(variant);

    if (existingItem) {
      // Update existing item
      existingItem.quantity = finalQuantity;
      existingItem.unit_price = effectivePrice.toString();
      existingItem.total_price = (effectivePrice * finalQuantity).toString();
      await manager.save(Cart, existingItem);
    } else {
      // Create new item
      const cartItem = manager.create(Cart, {
        cart_header_id: cartHeader.id,
        product_id: variant.product_id,
        product_variant_id: variant.id,
        product_name: variant.name,
        product_sku: variant.sku,
        variant_name: variant.name,
        quantity,
        unit_price: effectivePrice.toString(),
        total_price: (effectivePrice * quantity).toString(),
      });
      await manager.save(Cart, cartItem);
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItemQuantity(
    manager: EntityManager,
    cartItem: Cart,
    variant: ProductVariant,
    quantity: number,
  ): Promise<void> {
    const effectivePrice = this.calculateEffectivePrice(variant);
    
    cartItem.quantity = quantity;
    cartItem.unit_price = effectivePrice.toString();
    cartItem.total_price = (effectivePrice * quantity).toString();

    await manager.save(Cart, cartItem);
  }

  /**
   * Remove cart item
   */
  async removeCartItem(
    manager: EntityManager,
    cartItem: Cart,
  ): Promise<void> {
    await manager.remove(Cart, cartItem);
  }
}
