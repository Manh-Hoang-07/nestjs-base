import { Injectable, Inject } from '@nestjs/common';
import { Cart, CartHeader, ProductVariant } from '@prisma/client';
import { ICartItemRepository, CART_ITEM_REPOSITORY } from '../../domain/cart-item.repository';

@Injectable()
export class CartItemService {
  constructor(
    @Inject(CART_ITEM_REPOSITORY)
    private readonly cartItemRepository: ICartItemRepository,
  ) { }

  /**
   * Tính effective price (sale_price hoặc price)
   */
  calculateEffectivePrice(variant: ProductVariant): number {
    return variant.sale_price
      ? Number(variant.sale_price)
      : Number(variant.price);
  }

  /**
   * Tìm existing cart item
   */
  async findExistingCartItem(
    prisma: any,
    cartHeaderId: number | bigint,
    productVariantId: number | bigint,
  ): Promise<Cart | null> {
    return await prisma.cart.findFirst({
      where: {
        cart_header_id: BigInt(cartHeaderId),
        product_variant_id: BigInt(productVariantId),
        deleted_at: null,
      },
    });
  }

  /**
   * Tạo hoặc update cart item
   */
  async createOrUpdateCartItem(
    prisma: any,
    cartHeader: CartHeader,
    variant: ProductVariant,
    quantity: number,
  ): Promise<void> {
    const existingItem = await this.findExistingCartItem(
      prisma,
      cartHeader.id,
      variant.id,
    );

    const finalQuantity = existingItem
      ? Number(existingItem.quantity) + quantity
      : quantity;

    const effectivePrice = this.calculateEffectivePrice(variant);

    if (existingItem) {
      // Update existing item
      await prisma.cart.update({
        where: { id: existingItem.id },
        data: {
          quantity: finalQuantity,
          unit_price: effectivePrice,
          total_price: effectivePrice * finalQuantity,
        },
      });
    } else {
      // Create new item
      await prisma.cart.create({
        data: {
          cart_header_id: cartHeader.id,
          product_id: variant.product_id,
          product_variant_id: variant.id,
          product_name: variant.name,
          product_sku: variant.sku ?? '',
          variant_name: variant.name,
          quantity,
          unit_price: effectivePrice,
          total_price: effectivePrice * quantity,
        },
      });
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItemQuantity(
    prisma: any,
    cartItem: Cart,
    variant: ProductVariant,
    quantity: number,
  ): Promise<void> {
    const effectivePrice = this.calculateEffectivePrice(variant);

    await prisma.cart.update({
      where: { id: cartItem.id },
      data: {
        quantity: quantity,
        unit_price: effectivePrice,
        total_price: effectivePrice * quantity,
      }
    });
  }

  /**
   * Remove cart item
   */
  async removeCartItem(
    prisma: any,
    cartItem: Cart,
  ): Promise<void> {
    await prisma.cart.delete({
      where: { id: cartItem.id }
    });
  }
}


