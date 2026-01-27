import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CartHeader, Cart } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ICartRepository, CART_REPOSITORY } from '../../domain/cart.repository';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class CartManagementService {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    private readonly prisma: PrismaService,
  ) { }

  /**
   * Get or create cart
   */
  async getOrCreateCart(
    cartUuid?: string,
    userId?: number | bigint,
  ): Promise<CartHeader> {
    let cartHeader: CartHeader | null = null;

    // Ưu tiên: cart của user đăng nhập > cart guest theo uuid
    if (userId) {
      cartHeader = await this.cartRepository.findByUserId(userId);
    }

    // Nếu chưa có cart user và có cartUuid (guest)
    if (!cartHeader && cartUuid) {
      cartHeader = await this.prisma.cartHeader.findUnique({
        where: { uuid: cartUuid },
      }) as CartHeader | null;
    }

    // Create new cart if not found
    if (!cartHeader) {
      const ownerKey = userId
        ? `user_${userId}`
        : `guest_${uuidv4()}`;

      const finalCartUuid = cartUuid || uuidv4();

      cartHeader = await this.cartRepository.create({
        uuid: finalCartUuid,
        owner_key: ownerKey,
        currency: 'VND',
        subtotal: 0,
        tax_amount: 0,
        shipping_amount: 0,
        discount_amount: 0,
        total_amount: 0,
      });
    }

    return cartHeader;
  }

  /**
   * Get cart summary
   */
  async getCartSummary(
    cartHeader: CartHeader,
  ): Promise<any> {
    // PrismaRepository findBy methods already include items if configured in defaultSelect
    // But let's be explicit if needed.
    const fullCart = await this.prisma.cartHeader.findUnique({
      where: { id: cartHeader.id },
      include: {
        items: {
          include: {
            product: { select: { name: true, image: true, sku: true } },
            variant: { select: { name: true, image: true, sku: true, price: true } }
          }
        }
      }
    });

    if (!fullCart) throw new NotFoundException('Cart not found');

    return {
      cart_id: Number(fullCart.id),
      cart_uuid: fullCart.uuid,
      owner_key: fullCart.owner_key,
      subtotal: fullCart.subtotal,
      tax_amount: fullCart.tax_amount,
      shipping_amount: fullCart.shipping_amount,
      discount_amount: fullCart.discount_amount,
      coupon_code: fullCart.coupon_code,
      total_amount: fullCart.total_amount,
      items: fullCart.items.map(item => ({
        ...item,
        id: Number(item.id),
        cart_header_id: Number(item.cart_header_id),
        product_id: Number(item.product_id),
        product_variant_id: item.product_variant_id ? Number(item.product_variant_id) : null
      })),
    };
  }

  /**
   * Clear cart items
   */
  async clearCartItems(cartHeaderId: number | bigint): Promise<void> {
    await this.prisma.cart.deleteMany({
      where: {
        cart_header_id: BigInt(cartHeaderId),
      },
    });
  }

  /**
   * Get cart by ID
   */
  async getCartById(cartId: number | bigint): Promise<CartHeader> {
    const cartHeader = await this.cartRepository.findById(cartId);

    if (!cartHeader) {
      throw new NotFoundException('Cart not found');
    }

    return cartHeader;
  }

  /**
   * Get cart by ID with relations
   */
  async getCartByIdWithRelations(cartId: number | bigint): Promise<CartHeader> {
    const cartHeader = await this.prisma.cartHeader.findUnique({
      where: { id: BigInt(cartId) },
      include: {
        items: {
          include: {
            variant: true
          }
        }
      },
    });

    if (!cartHeader) {
      throw new NotFoundException('Cart not found');
    }

    return cartHeader as any;
  }
}
