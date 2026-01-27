import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Cart, CartHeader, ProductVariant, PrismaClient } from '@prisma/client';

@Injectable()
export class CartValidationService {
  /**
   * Validate cart ownership và permission
   */
  validateCartOwnership(
    cartHeader: CartHeader,
    options: {
      userId?: number | bigint;
      cartUuid?: string;
    },
  ): void {
    const { userId, cartUuid } = options;

    // User đã đăng nhập: owner_key phải là user_<id>
    if (userId) {
      if (cartHeader.owner_key !== `user_${userId}`) {
        throw new ForbiddenException('Bạn không có quyền sửa giỏ hàng này');
      }
      return;
    }

    // Guest: bắt buộc phải khớp uuid nếu được truyền vào
    if (cartUuid && cartHeader.uuid && cartHeader.uuid !== cartUuid) {
      throw new ForbiddenException('Bạn không có quyền sửa giỏ hàng này');
    }
  }

  /**
   * Validate và lấy cart item với cart header
   */
  async validateAndGetCartItem(
    prisma: any, // Can be PrismaClient or TransactionClient
    cartItemId: number | bigint,
  ): Promise<{ cartItem: Cart; cartHeader: CartHeader }> {
    const cartItem = await prisma.cart.findUnique({
      where: { id: BigInt(cartItemId) },
      include: { variant: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    const cartHeader = await prisma.cartHeader.findUnique({
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
    prisma: any,
    productVariantId: number | bigint,
  ): Promise<ProductVariant> {
    // In Prisma, we can use $queryRaw for pessimistic locking if really needed:
    // const variants = await prisma.$queryRaw`SELECT * FROM product_variants WHERE id = ${productVariantId} FOR UPDATE`;
    // const productVariant = variants[0];

    // For now, using regular findUnique inside transaction (passed via prisma param)
    const productVariant = await prisma.productVariant.findUnique({
      where: {
        id: BigInt(productVariantId),
        is_active: true,
      },
    });

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
