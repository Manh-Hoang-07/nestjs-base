import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ICartRepository, CART_REPOSITORY } from '@/modules/ecommerce/cart/domain/cart.repository';
import { ICartItemRepository, CART_ITEM_REPOSITORY } from '@/modules/ecommerce/cart/domain/cart-item.repository';
import { IProductVariantRepository, PRODUCT_VARIANT_REPOSITORY } from '@/modules/ecommerce/product-variant/domain/product-variant.repository';
import { IShippingMethodRepository, SHIPPING_METHOD_REPOSITORY } from '@/modules/ecommerce/shipping-method/domain/shipping-method.repository';
import { IPaymentMethodRepository, PAYMENT_METHOD_REPOSITORY } from '@/modules/payment/domain/payment-method.repository';

@Injectable()
export class OrderValidationService {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    @Inject(CART_ITEM_REPOSITORY)
    private readonly cartItemRepository: ICartItemRepository,
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly productVariantRepository: IProductVariantRepository,
    @Inject(SHIPPING_METHOD_REPOSITORY)
    private readonly shippingMethodRepository: IShippingMethodRepository,
    @Inject(PAYMENT_METHOD_REPOSITORY)
    private readonly paymentMethodRepository: IPaymentMethodRepository,
  ) { }

  /**
   * Validate và lấy cart
   * Đảm bảo user_id match với cart owner để tránh security issues
   */
  async validateAndGetCart(
    tx: Prisma.TransactionClient,
    userId?: number | bigint,
    cartUuid?: string,
  ): Promise<any> {
    let cartHeader: any = null;

    if (userId) {
      // Nếu đã đăng nhập, tìm cart theo userId
      cartHeader = await tx.cartHeader.findFirst({
        where: { owner_key: `user_${userId}` },
      });

      // CRITICAL: Validate ownership ngay sau khi tìm thấy cart
      if (cartHeader && cartHeader.owner_key !== `user_${userId}`) {
        throw new ForbiddenException('Cart does not belong to this user');
      }
    } else if (cartUuid) {
      // Guest cart - chỉ tìm theo UUID
      cartHeader = await tx.cartHeader.findFirst({
        where: { uuid: cartUuid },
      });

      // CRITICAL: Nếu có userId nhưng cart là guest cart, reject
      if (cartHeader && userId && cartHeader.owner_key && !cartHeader.owner_key.startsWith('user_')) {
        throw new ForbiddenException('You do not have permission to use this cart');
      }
    }

    if (!cartHeader) {
      throw new NotFoundException('Cart not found');
    }

    // Final ownership validation
    if (userId && cartHeader.owner_key !== `user_${userId}`) {
      throw new ForbiddenException('You do not have permission to use this cart');
    }

    return cartHeader;
  }

  /**
   * Validate cart items không rỗng
   */
  async validateCartItems(
    tx: Prisma.TransactionClient,
    cartHeaderId: number | bigint,
  ): Promise<any[]> {
    const cartItems = await tx.cart.findMany({
      where: { cart_header_id: BigInt(cartHeaderId) },
      include: {
        variant: true,
      },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    return cartItems;
  }

  /**
   * Validate và lock product variants
   */
  async validateProductVariants(
    tx: Prisma.TransactionClient,
    cartItems: any[],
  ): Promise<Map<number | bigint, any>> {
    const variantIds = cartItems.map(item => BigInt(item.product_variant_id)).filter(Boolean);

    const variants = await tx.productVariant.findMany({
      where: {
        id: { in: variantIds },
        is_active: true,
        product: { status: 'active' },
      },
      include: {
        product: true,
      },
    });

    const variantMap = new Map(variants.map(v => [v.id, v]));

    // Validate từng item
    for (const item of cartItems) {
      if (!item.product_variant_id) {
        throw new BadRequestException(`Product variant ID missing for ${item.product_name}`);
      }

      const variantId = BigInt(item.product_variant_id);
      const variant = variantMap.get(variantId);

      if (!variant) {
        throw new BadRequestException(`Product variant not found or inactive for ${item.product_name}`);
      }

      if (variant.stock_quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.product_name}. Available: ${variant.stock_quantity}, Requested: ${item.quantity}`
        );
      }
    }

    return variantMap;
  }

  /**
   * Validate shipping method
   */
  async validateShippingMethod(
    tx: Prisma.TransactionClient,
    shippingMethodId: number | bigint,
  ): Promise<any> {
    const shippingMethod = await tx.shippingMethod.findUnique({
      where: { id: BigInt(shippingMethodId), status: 'active' },
    });

    if (!shippingMethod) {
      throw new BadRequestException('Shipping method not found or inactive');
    }

    return shippingMethod;
  }

  /**
   * Validate payment method cho digital/mixed orders
   */
  async validatePaymentMethodForOrderType(
    tx: Prisma.TransactionClient,
    orderType: string,
    paymentMethodId?: number | bigint,
  ): Promise<void> {
    if (orderType === 'digital' || orderType === 'mixed') {
      if (paymentMethodId) {
        const paymentMethod = await tx.paymentMethod.findUnique({
          where: { id: BigInt(paymentMethodId) },
        });

        if (paymentMethod?.code?.toUpperCase() === 'COD') {
          throw new BadRequestException('COD is not available for digital or mixed orders');
        }
      }
    }
  }
}
