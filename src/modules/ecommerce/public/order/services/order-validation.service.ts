import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CartHeader } from '@/shared/entities/cart-header.entity';
import { Cart } from '@/shared/entities/cart.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { ShippingMethod } from '@/shared/entities/shipping-method.entity';
import { PaymentMethod } from '@/shared/entities/payment-method.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { OrderType } from '@/shared/enums/order-type.enum';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class OrderValidationService {
  /**
   * Validate và lấy cart với pessimistic lock
   * Đảm bảo user_id match với cart owner để tránh security issues
   */
  async validateAndGetCart(
    manager: EntityManager,
    userId?: number,
    cartUuid?: string,
  ): Promise<CartHeader> {
    let cartHeader: CartHeader | null = null;

    if (userId) {
      // Nếu đã đăng nhập, tìm cart theo userId với pessimistic lock
      cartHeader = await manager
        .createQueryBuilder(CartHeader, 'cart_header')
        .setLock('pessimistic_write')
        .where('cart_header.owner_key = :ownerKey', { ownerKey: `user_${userId}` })
        .getOne();
      
      // CRITICAL: Validate ownership ngay sau khi tìm thấy cart
      // Đảm bảo cart thuộc về user này
      if (cartHeader && cartHeader.owner_key !== `user_${userId}`) {
        throw new ForbiddenException('Cart does not belong to this user');
      }
    } else if (cartUuid) {
      // Guest cart - chỉ tìm theo UUID
      cartHeader = await manager
        .createQueryBuilder(CartHeader, 'cart_header')
        .setLock('pessimistic_write')
        .where('cart_header.uuid = :uuid', { uuid: cartUuid })
        .getOne();
      
      // CRITICAL: Nếu có userId nhưng cart là guest cart, reject
      // Tránh trường hợp user cố gắng dùng cart của guest khác
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
    manager: EntityManager,
    cartHeaderId: number,
  ): Promise<Cart[]> {
    const cartItems = await manager
      .createQueryBuilder(Cart, 'cart')
      .leftJoinAndSelect('cart.variant', 'variant')
      .setLock('pessimistic_write')
      .where('cart.cart_header_id = :cartHeaderId', { cartHeaderId })
      .getMany();

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    return cartItems;
  }

  /**
   * Validate và lock product variants
   */
  async validateProductVariants(
    manager: EntityManager,
    cartItems: Cart[],
  ): Promise<Map<number, ProductVariant>> {
    const variantIds = cartItems.map(item => item.product_variant_id).filter(Boolean);
    
    const variants = await manager
      .createQueryBuilder(ProductVariant, 'variant')
      .leftJoinAndSelect('variant.product', 'product')
      .setLock('pessimistic_write')
      .whereInIds(variantIds)
      .andWhere('variant.status = :status', { status: BasicStatus.Active })
      .andWhere('product.status = :productStatus', { productStatus: BasicStatus.Active })
      .getMany();

    const variantMap = new Map(variants.map(v => [v.id, v]));

    // Validate từng item
    for (const item of cartItems) {
      if (!item.product_variant_id) {
        throw new BadRequestException(`Product variant ID missing for ${item.product_name}`);
      }

      const variantId = item.product_variant_id as number;
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
    manager: EntityManager,
    shippingMethodId: number,
  ): Promise<ShippingMethod> {
    const shippingMethod = await manager.findOne(ShippingMethod, {
      where: { id: shippingMethodId, status: BasicStatus.Active },
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
    manager: EntityManager,
    orderType: OrderType,
    paymentMethodId?: number,
  ): Promise<void> {
    if (orderType === OrderType.DIGITAL || orderType === OrderType.MIXED) {
      if (paymentMethodId) {
        const paymentMethod = await manager.findOne(PaymentMethod, {
          where: { id: paymentMethodId },
        });
        
        if (paymentMethod?.code === 'COD') {
          throw new BadRequestException('COD is not available for digital or mixed orders');
        }
      }
    }
  }
}
