import { Injectable, Inject } from '@nestjs/common';
import { CartHeader } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { CartValidationService } from './cart-validation.service';
import { CartItemService } from './cart-item.service';
import { CartCalculationService } from './cart-calculation.service';
import { CartManagementService } from './cart-management.service';
import { ICartRepository, CART_REPOSITORY } from '../../domain/cart.repository';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class PublicCartService extends BaseService<CartHeader, ICartRepository> {
  constructor(
    @Inject(CART_REPOSITORY)
    protected readonly cartRepository: ICartRepository,
    private readonly prisma: PrismaService,
    private readonly validationService: CartValidationService,
    private readonly itemService: CartItemService,
    private readonly calculationService: CartCalculationService,
    private readonly managementService: CartManagementService,
  ) {
    super(cartRepository);
  }

  async getOrCreateCart(
    cartUuid?: string,
    userId?: number | bigint,
  ) {
    return this.managementService.getOrCreateCart(cartUuid, userId);
  }

  async getCartByIdWithRelations(cartId: number | bigint) {
    return this.managementService.getCartByIdWithRelations(cartId);
  }

  async addToCart(
    productVariantId: number | bigint,
    quantity: number,
    cartUuid?: string,
    userId?: number | bigint,
  ): Promise<any> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Get or create cart
      const cartHeader = await this.managementService.getOrCreateCart(
        cartUuid,
        userId,
      );

      // 2. Validate and lock product variant
      const productVariant = await this.validationService.validateAndLockProductVariant(
        tx,
        productVariantId,
      );

      // 3. Check existing item
      const existingItem = await this.itemService.findExistingCartItem(
        tx,
        cartHeader.id,
        productVariantId,
      );

      const finalQuantity = existingItem
        ? Number(existingItem.quantity) + quantity
        : quantity;

      // 4. Validate stock
      this.validationService.validateStockQuantity(productVariant, finalQuantity);

      // 5. Create or update cart item
      await this.itemService.createOrUpdateCartItem(
        tx,
        cartHeader,
        productVariant,
        quantity,
      );

      // 6. Update cart totals
      await this.calculationService.updateCartTotals(
        tx,
        cartHeader.id,
      );

      // 8. Return updated cart
      return await this.getCartSummary(cartHeader.uuid || undefined, userId, tx);
    });
  }

  async updateCartItem(
    cartItemId: number | bigint,
    quantity: number,
    cartUuid?: string,
    userId?: number | bigint,
  ): Promise<any> {
    if (quantity <= 0) {
      return this.removeFromCart(cartItemId, cartUuid, userId);
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Validate và lấy cart item với cart header
      const { cartItem, cartHeader } = await this.validationService.validateAndGetCartItem(
        tx,
        cartItemId,
      );

      // 2. Validate ownership
      this.validationService.validateCartOwnership(cartHeader, {
        userId,
        cartUuid,
      });

      // 3. Validate and lock variant
      const variant = await this.validationService.validateAndLockProductVariant(
        tx,
        Number(cartItem.product_variant_id),
      );

      // 4. Validate stock
      this.validationService.validateStockQuantity(variant, quantity);

      // 5. Update cart item
      await this.itemService.updateCartItemQuantity(
        tx,
        cartItem,
        variant,
        quantity,
      );

      // 6. Update cart totals
      await this.calculationService.updateCartTotals(
        tx,
        cartHeader.id,
      );

      return await this.getCartSummary(cartHeader.uuid || undefined, userId, tx);
    });
  }

  async removeFromCart(
    cartItemId: number | bigint,
    cartUuid?: string,
    userId?: number | bigint,
  ): Promise<any> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Validate và lấy cart item với cart header
      const { cartItem, cartHeader } = await this.validationService.validateAndGetCartItem(
        tx,
        cartItemId,
      );

      // 2. Validate ownership
      this.validationService.validateCartOwnership(cartHeader, {
        userId,
        cartUuid,
      });

      // 3. Remove cart item
      await this.itemService.removeCartItem(tx, cartItem);

      // 4. Update cart totals
      await this.calculationService.updateCartTotals(
        tx,
        cartHeader.id,
      );

      return await this.getCartSummary(cartHeader.uuid || undefined, userId, tx);
    });
  }

  async clearCart(cartUuid?: string, userId?: number | bigint): Promise<any> {
    const cartHeader = await this.managementService.getOrCreateCart(
      cartUuid,
      userId,
    );

    await this.managementService.clearCartItems(cartHeader.id);

    // Update totals
    await this.calculationService.updateCartTotals(this.prisma, cartHeader.id);

    return await this.getCartSummary(cartHeader.uuid || undefined, userId);
  }

  async getCartSummary(
    cartUuid?: string,
    userId?: number | bigint,
    tx?: any,
  ): Promise<any> {
    const cartHeader = await this.managementService.getOrCreateCart(
      cartUuid,
      userId,
    );

    return this.managementService.getCartSummary(cartHeader, tx);
  }

  /**
   * Apply discount to cart
   */
  async applyDiscount(
    cartId: number | bigint,
    discountInfo: {
      discountAmount: number;
      couponCode?: string;
      couponId?: number | bigint;
    },
  ): Promise<any> {
    const cartHeader = await this.managementService.getCartById(cartId);

    const subtotal = Number(cartHeader.subtotal) || 0;
    const taxAmount = Number(cartHeader.tax_amount) || 0;
    const shippingAmount = Number(cartHeader.shipping_amount) || 0;
    const discountAmount = Number(discountInfo.discountAmount) || 0;

    const totalAmount = this.calculationService.calculateTotalWithDiscount(
      subtotal,
      taxAmount,
      shippingAmount,
      discountAmount,
    );

    // Update cart header
    await this.cartRepository.update(cartId, {
      discount_amount: discountAmount,
      coupon_code: discountInfo.couponCode || null,
      total_amount: totalAmount,
    } as any);

    return this.managementService.getCartSummary(cartHeader);
  }

  /**
   * Remove discount from cart
   */
  async removeDiscount(cartId: number | bigint): Promise<any> {
    const cartHeader = await this.managementService.getCartById(cartId);

    const subtotal = Number(cartHeader.subtotal) || 0;
    const taxAmount = Number(cartHeader.tax_amount) || 0;
    const shippingAmount = Number(cartHeader.shipping_amount) || 0;

    const totalAmount = this.calculationService.calculateTotalWithDiscount(
      subtotal,
      taxAmount,
      shippingAmount,
      0, // No discount
    );

    // Update cart header
    await this.cartRepository.update(cartId, {
      discount_amount: 0,
      coupon_code: null,
      total_amount: totalAmount,
    } as any);

    return this.managementService.getCartSummary(cartHeader);
  }
}

