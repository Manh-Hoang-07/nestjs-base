import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartHeader } from '@/shared/entities/cart-header.entity';
import { Cart } from '@/shared/entities/cart.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CartManagementService {
  constructor(
    @InjectRepository(CartHeader)
    private readonly cartHeaderRepository: Repository<CartHeader>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  /**
   * Get or create cart
   */
  async getOrCreateCart(
    sessionId?: string,
    cartUuid?: string,
    userId?: number,
  ): Promise<CartHeader> {
    let cartHeader: CartHeader | null = null;

    // Priority: userId > cartUuid > sessionId
    if (userId) {
      cartHeader = await this.cartHeaderRepository.findOne({
        where: { owner_key: `user_${userId}` },
        relations: ['items', 'items.variant'],
      });
    }

    if (!cartHeader && cartUuid) {
      cartHeader = await this.cartHeaderRepository.findOne({
        where: { uuid: cartUuid },
        relations: ['items', 'items.variant'],
      });
    }

    if (!cartHeader && sessionId) {
      cartHeader = await this.cartHeaderRepository.findOne({
        where: { owner_key: `session_${sessionId}` },
        relations: ['items', 'items.variant'],
      });
    }

    // Create new cart if not found
    if (!cartHeader) {
      const ownerKey = userId
        ? `user_${userId}`
        : sessionId
          ? `session_${sessionId}`
          : `guest_${uuidv4()}`;

      const finalCartUuid = cartUuid || uuidv4();

      cartHeader = this.cartHeaderRepository.create({
        uuid: finalCartUuid,
        owner_key: ownerKey,
        currency: 'VND',
        subtotal: '0',
        tax_amount: '0',
        shipping_amount: '0',
        discount_amount: '0',
        total_amount: '0',
      });
      cartHeader = await this.cartHeaderRepository.save(cartHeader);
    }

    return cartHeader;
  }

  /**
   * Get cart summary
   */
  async getCartSummary(
    cartHeader: CartHeader,
  ): Promise<any> {
    const items = await this.cartRepository.find({
      where: { cart_header_id: cartHeader.id },
      relations: ['variant'],
    });

    return {
      cart_id: cartHeader.id,
      cart_uuid: cartHeader.uuid,
      owner_key: cartHeader.owner_key,
      subtotal: cartHeader.subtotal || '0',
      tax_amount: cartHeader.tax_amount || '0',
      shipping_amount: cartHeader.shipping_amount || '0',
      discount_amount: cartHeader.discount_amount || '0',
      coupon_code: cartHeader.coupon_code || null,
      total_amount: cartHeader.total_amount || '0',
      items: items,
    };
  }

  /**
   * Clear cart items
   */
  async clearCartItems(cartHeaderId: number): Promise<void> {
    await this.cartRepository.delete({
      cart_header_id: cartHeaderId,
    });
  }

  /**
   * Get cart by ID
   */
  async getCartById(cartId: number): Promise<CartHeader> {
    const cartHeader = await this.cartHeaderRepository.findOne({
      where: { id: cartId },
    });

    if (!cartHeader) {
      throw new NotFoundException('Cart not found');
    }

    return cartHeader;
  }

  /**
   * Get cart by ID with relations
   */
  async getCartByIdWithRelations(cartId: number): Promise<CartHeader> {
    const cartHeader = await this.cartHeaderRepository.findOne({
      where: { id: cartId },
      relations: ['items', 'items.variant'],
    });

    if (!cartHeader) {
      throw new NotFoundException('Cart not found');
    }

    return cartHeader;
  }
}
