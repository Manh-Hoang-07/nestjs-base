import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Cart } from '@/shared/entities/cart.entity';
import { CartHeader } from '@/shared/entities/cart-header.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

@Injectable()
export class CartValidationService {
  /**
   * Validate cart ownership và permission
   */
  validateCartOwnership(
    cartHeader: CartHeader,
    userId?: number,
    sessionId?: string,
  ): void {
    if (userId && cartHeader.owner_key !== `user_${userId}`) {
      throw new ForbiddenException('Bạn không có quyền sửa giỏ hàng này');
    }

    if (sessionId && cartHeader.owner_key !== `session_${sessionId}`) {
      throw new ForbiddenException('Bạn không có quyền sửa giỏ hàng này');
    }
  }

  /**
   * Validate và lấy cart item với cart header
   */
  async validateAndGetCartItem(
    manager: EntityManager,
    cartItemId: number,
  ): Promise<{ cartItem: Cart; cartHeader: CartHeader }> {
    const cartItem = await manager.findOne(Cart, {
      where: { id: cartItemId },
      relations: ['variant'],
    });

    if (!cartItem) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    const cartHeader = await manager.findOne(CartHeader, {
      where: { id: cartItem.cart_header_id },
    });

    if (!cartHeader) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    return { cartItem, cartHeader };
  }

  /**
   * Validate và lock product variant
   */
  async validateAndLockProductVariant(
    manager: EntityManager,
    productVariantId: number,
  ): Promise<ProductVariant> {
    const productVariant = await manager
      .createQueryBuilder(ProductVariant, 'variant')
      .setLock('pessimistic_write')
      .where('variant.id = :id', { id: productVariantId })
      .andWhere('variant.status = :status', { status: BasicStatus.Active })
      .getOne();

    if (!productVariant) {
      throw new NotFoundException('Sản phẩm không tồn tại hoặc đã bị vô hiệu hóa');
    }

    return productVariant;
  }

  /**
   * Validate stock quantity
   */
  validateStockQuantity(
    variant: ProductVariant,
    requestedQuantity: number,
  ): void {
    if (variant.stock_quantity < requestedQuantity) {
      throw new BadRequestException(
        `Chỉ còn ${variant.stock_quantity} sản phẩm trong kho`
      );
    }
  }
}
