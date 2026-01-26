import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cart } from '@/shared/entities/cart.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { CartValidationService } from './cart-validation.service';
import { CartItemService } from './cart-item.service';
import { CartCalculationService } from './cart-calculation.service';
import { CartManagementService } from './cart-management.service';

@Injectable()
export class PublicCartService extends CrudService<Cart> {
  constructor(
    @InjectRepository(Cart)
    protected readonly cartRepository: Repository<Cart>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly validationService: CartValidationService,
    private readonly itemService: CartItemService,
    private readonly calculationService: CartCalculationService,
    private readonly managementService: CartManagementService,
  ) {
    super(cartRepository);
  }

  async getOrCreateCart(
    sessionId?: string,
    cartUuid?: string,
    userId?: number,
  ) {
    return this.managementService.getOrCreateCart(sessionId, cartUuid, userId);
  }

  /**
   * Get cart by ID with relations (for external use)
   */
  async getCartByIdWithRelations(cartId: number) {
    return this.managementService.getCartByIdWithRelations(cartId);
  }

  async addToCart(
    productVariantId: number,
    quantity: number,
    sessionId?: string,
    cartUuid?: string,
    userId?: number,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Get or create cart
      const cartHeader = await this.managementService.getOrCreateCart(
        sessionId,
        cartUuid,
        userId,
      );

      // 2. Validate and lock product variant
      const productVariant = await this.validationService.validateAndLockProductVariant(
        queryRunner.manager,
        productVariantId,
      );

      // 3. Check existing item và tính final quantity
      const existingItem = await this.itemService.findExistingCartItem(
        queryRunner.manager,
        cartHeader.id,
        productVariantId,
      );

      const finalQuantity = existingItem
        ? existingItem.quantity + quantity
        : quantity;

      // 4. Validate stock
      if (productVariant.stock_quantity < finalQuantity) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(
          `Chỉ còn ${productVariant.stock_quantity} sản phẩm trong kho`
        );
      }

      // 5. Create or update cart item
      await this.itemService.createOrUpdateCartItem(
        queryRunner.manager,
        cartHeader,
        productVariant,
        quantity,
      );

      // 6. Update cart totals
      await this.calculationService.updateCartTotals(
        queryRunner.manager,
        cartHeader.id,
      );

      // 7. Commit transaction
      await queryRunner.commitTransaction();

      // 8. Return updated cart
      return await this.getCartSummary(sessionId, cartHeader.uuid || undefined, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateCartItem(
    cartItemId: number,
    quantity: number,
    sessionId?: string,
    cartUuid?: string,
    userId?: number,
  ): Promise<any> {
    if (quantity <= 0) {
      return this.removeFromCart(cartItemId, sessionId, cartUuid, userId);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validate và lấy cart item với cart header
      const { cartItem, cartHeader } = await this.validationService.validateAndGetCartItem(
        queryRunner.manager,
        cartItemId,
      );

      // 2. Validate ownership
      this.validationService.validateCartOwnership(cartHeader, userId, sessionId);

      // 3. Validate and lock variant
      const variant = await this.validationService.validateAndLockProductVariant(
        queryRunner.manager,
        cartItem.product_variant_id!,
      );

      // 4. Validate stock
      if (variant.stock_quantity < quantity) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(
          `Chỉ còn ${variant.stock_quantity} sản phẩm trong kho`
        );
      }

      // 5. Update cart item
      await this.itemService.updateCartItemQuantity(
        queryRunner.manager,
        cartItem,
        variant,
        quantity,
      );

      // 6. Update cart totals
      await this.calculationService.updateCartTotals(
        queryRunner.manager,
        cartHeader.id,
      );

      await queryRunner.commitTransaction();

      return await this.getCartSummary(sessionId, cartHeader.uuid || undefined, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeFromCart(
    cartItemId: number,
    sessionId?: string,
    cartUuid?: string,
    userId?: number,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validate và lấy cart item với cart header
      const { cartItem, cartHeader } = await this.validationService.validateAndGetCartItem(
        queryRunner.manager,
        cartItemId,
      );

      // 2. Validate ownership
      this.validationService.validateCartOwnership(cartHeader, userId, sessionId);

      // 3. Remove cart item
      await this.itemService.removeCartItem(queryRunner.manager, cartItem);

      // 4. Update cart totals
      await this.calculationService.updateCartTotals(
        queryRunner.manager,
        cartHeader.id,
      );

      await queryRunner.commitTransaction();

      return await this.getCartSummary(sessionId, cartHeader.uuid || undefined, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async clearCart(sessionId?: string, cartUuid?: string, userId?: number): Promise<any> {
    const cartHeader = await this.managementService.getOrCreateCart(
      sessionId,
      cartUuid,
      userId,
    );

    await this.managementService.clearCartItems(cartHeader.id);

    // Update totals using repository (not transaction)
    const items = await this.cartRepository.find({
      where: { cart_header_id: cartHeader.id },
    });

    const subtotal = items.reduce(
      (sum, item) => sum + parseFloat(item.total_price || '0'),
      0,
    );

    const cartHeaderUpdated = await this.managementService.getCartById(cartHeader.id);
    const taxAmount = parseFloat(cartHeaderUpdated.tax_amount) || 0;
    const shippingAmount = parseFloat(cartHeaderUpdated.shipping_amount) || 0;
    const discountAmount = parseFloat(cartHeaderUpdated.discount_amount) || 0;
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Simple update without transaction for clearCart
    await this.cartRepository.manager.update(
      'CartHeader',
      cartHeader.id,
      {
        subtotal: subtotal.toString(),
        total_amount: totalAmount.toString(),
      },
    );

    return await this.getCartSummary(sessionId, cartHeader.uuid || undefined, userId);
  }

  async getCartSummary(
    sessionId?: string,
    cartUuid?: string,
    userId?: number,
  ): Promise<any> {
    const cartHeader = await this.managementService.getOrCreateCart(
      sessionId,
      cartUuid,
      userId,
    );

    return this.managementService.getCartSummary(cartHeader);
  }

  /**
   * Apply discount to cart
   */
  async applyDiscount(
    cartId: number,
    discountInfo: {
      discountAmount: number;
      couponCode?: string;
      couponId?: number;
    },
  ): Promise<any> {
    const cartHeader = await this.managementService.getCartById(cartId);

    const subtotal = parseFloat(cartHeader.subtotal) || 0;
    const taxAmount = parseFloat(cartHeader.tax_amount) || 0;
    const shippingAmount = parseFloat(cartHeader.shipping_amount) || 0;
    const discountAmount = parseFloat(discountInfo.discountAmount.toString()) || 0;

    const totalAmount = this.calculationService.calculateTotalWithDiscount(
      subtotal,
      taxAmount,
      shippingAmount,
      discountAmount,
    );

    // Update cart header
    await this.cartRepository.manager.update('CartHeader', cartId, {
      discount_amount: discountAmount.toString(),
      coupon_code: discountInfo.couponCode || null,
      total_amount: totalAmount.toString(),
    });

    return this.managementService.getCartSummary(cartHeader);
  }

  /**
   * Remove discount from cart
   */
  async removeDiscount(cartId: number): Promise<any> {
    const cartHeader = await this.managementService.getCartById(cartId);

    const subtotal = parseFloat(cartHeader.subtotal) || 0;
    const taxAmount = parseFloat(cartHeader.tax_amount) || 0;
    const shippingAmount = parseFloat(cartHeader.shipping_amount) || 0;

    const totalAmount = this.calculationService.calculateTotalWithDiscount(
      subtotal,
      taxAmount,
      shippingAmount,
      0, // No discount
    );

    // Update cart header
    await this.cartRepository.manager.update('CartHeader', cartId, {
      discount_amount: '0',
      coupon_code: null,
      total_amount: totalAmount.toString(),
    });

    return this.managementService.getCartSummary(cartHeader);
  }

}