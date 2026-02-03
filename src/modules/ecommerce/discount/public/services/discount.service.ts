import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { Coupon } from '@prisma/client';
import { ICouponRepository, ICouponUsageRepository, COUPON_REPOSITORY, COUPON_USAGE_REPOSITORY } from '../../domain/coupon.repository';
import { IOrderRepository, ORDER_REPOSITORY } from '@/modules/ecommerce/order/domain/order.repository';
import { ICartRepository, CART_REPOSITORY } from '@/modules/ecommerce/cart/domain/cart.repository';
import { ICartItemRepository, CART_ITEM_REPOSITORY } from '@/modules/ecommerce/cart/domain/cart-item.repository';

@Injectable()
export class DiscountService {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
    @Inject(COUPON_USAGE_REPOSITORY)
    private readonly couponUsageRepository: ICouponUsageRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    @Inject(CART_ITEM_REPOSITORY)
    private readonly cartItemRepository: ICartItemRepository,
  ) { }

  /**
   * Calculate discount for coupon (without applying to cart)
   */
  async calculateCouponDiscount(
    cartId: number | bigint,
    couponCode: string,
    userId?: number | bigint,
  ): Promise<any> {
    // 1. Find coupon
    const coupon = await this.couponRepository.findByCode(couponCode);

    if (!coupon || coupon.status !== 'active') {
      throw new BadRequestException('Mã giảm giá không hợp lệ hoặc đã hết hạn');
    }

    // 2. Validate coupon
    await this.validateCoupon(coupon, userId);

    // 3. Calculate discount
    const cart = await this.getCartWithItems(cartId);
    const discountAmount = await this.calculateDiscount(coupon, cart);

    return {
      coupon: {
        id: Number(coupon.id),
        code: coupon.code,
        name: coupon.name,
        discount_type: coupon.type,
        discount_value: Number(coupon.value),
      },
      discountAmount,
      cart,
    };
  }

  /**
   * Validate coupon eligibility
   */
  private async validateCoupon(coupon: Coupon, userId?: number | bigint): Promise<void> {
    const now = new Date();

    // Check dates
    if (coupon.start_date && now < coupon.start_date) {
      throw new BadRequestException('Mã giảm giá chưa đến thời gian sử dụng');
    }
    if (coupon.end_date && now > coupon.end_date) {
      throw new BadRequestException('Mã giảm giá đã hết hạn');
    }

    // Check total usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      throw new BadRequestException('Mã giảm giá này đã được sử dụng hết');
    }

    // Check per-user usage limit
    if (userId) {
      await this.couponUsageRepository.findByUser(coupon.id, userId);
      // Logic for usage limit per user could be added here if needed
    }
  }

  /**
   * Calculate discount amount
   */
  private async calculateDiscount(coupon: Coupon, cart: any): Promise<number> {
    const subtotal = Number(cart.subtotal || 0);

    // Check minimum order value
    const minOrderValue = Number(coupon.min_order_value || 0);
    if (subtotal < minOrderValue) {
      throw new BadRequestException(
        `Đơn hàng tối thiểu phải đạt ${minOrderValue}đ để sử dụng mã này`
      );
    }

    let discountAmount = 0;

    switch (coupon.type) {
      case 'percentage':
        discountAmount = (subtotal * Number(coupon.value)) / 100;
        break;

      case 'fixed_amount':
        discountAmount = Math.min(Number(coupon.value), subtotal);
        break;

      case 'free_shipping':
        discountAmount = Number(cart.shipping_amount || 0);
        break;
    }

    // Apply max discount limit
    if (coupon.max_discount) {
      discountAmount = Math.min(
        discountAmount,
        Number(coupon.max_discount),
      );
    }

    return Math.round(discountAmount * 100) / 100;
  }

  /**
   * Record coupon usage
   */
  async recordCouponUsage(
    couponId: number | bigint,
    userId: number | bigint,
    orderId: number | bigint,
    discountAmount: number,
    orderTotal: number,
  ): Promise<void> {
    // Create usage record
    await this.couponUsageRepository.create({
      coupon_id: BigInt(couponId),
      user_id: BigInt(userId),
      order_id: BigInt(orderId),
      discount_amount: discountAmount,
      order_total: orderTotal,
    });

    // Increment coupon used_count
    await this.couponRepository.incrementUsedCount(couponId);
  }

  /**
   * Get available coupons for user
   */
  async getAvailableCoupons(userId?: number | bigint): Promise<any> {
    const now = new Date();

    const coupons = await this.couponRepository.findMany({
      status: 'active',
    });

    // Filter by dates
    const activeCoupons = coupons.filter(c =>
      (!c.start_date || c.start_date <= now) &&
      (!c.end_date || c.end_date >= now) &&
      (!c.usage_limit || c.used_count < c.usage_limit)
    );

    const transformedCoupons = activeCoupons.map((coupon: Coupon) => ({
      id: Number(coupon.id),
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discount_type: coupon.type,
      discount_value: Number(coupon.value),
      minimum_order_amount: Number(coupon.min_order_value),
      maximum_discount_amount: coupon.max_discount ? Number(coupon.max_discount) : null,
      usage_limit: coupon.usage_limit,
      usage_count: coupon.used_count || 0,
      start_date: coupon.start_date,
      end_date: coupon.end_date,
      is_active: true,
    }));

    return {
      message: 'Lấy danh sách mã giảm giá thành công',
      data: transformedCoupons,
    };
  }

  /**
   * Validate coupon without applying to cart
   */
  async validateCouponCode(
    couponCode: string,
    cartTotal?: number,
    userId?: number | bigint,
  ): Promise<any> {
    const coupon = await this.couponRepository.findByCode(couponCode);

    if (!coupon || coupon.status !== 'active') {
      throw new BadRequestException('Mã giảm giá không tồn tại hoặc đã hết hạn');
    }

    await this.validateCoupon(coupon, userId);

    let estimatedDiscount = 0;
    let finalAmount = cartTotal || 0;

    if (cartTotal) {
      const minOrderValue = Number(coupon.min_order_value || 0);
      if (cartTotal < minOrderValue) {
        throw new BadRequestException(
          `Đơn hàng tối thiểu phải đạt ${minOrderValue}đ để sử dụng mã này`
        );
      }

      switch (coupon.type) {
        case 'percentage':
          estimatedDiscount = (cartTotal * Number(coupon.value)) / 100;
          break;
        case 'fixed_amount':
          estimatedDiscount = Math.min(Number(coupon.value), cartTotal);
          break;
        case 'free_shipping':
          estimatedDiscount = 0;
          break;
      }

      if (coupon.max_discount) {
        estimatedDiscount = Math.min(
          estimatedDiscount,
          Number(coupon.max_discount),
        );
      }

      finalAmount = cartTotal - estimatedDiscount;
    }

    return {
      message: 'Mã giảm giá hợp lệ',
      data: {
        id: Number(coupon.id),
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discount_type: coupon.type,
        discount_value: Number(coupon.value),
        minimum_order_amount: Number(coupon.min_order_value),
        maximum_discount_amount: coupon.max_discount ? Number(coupon.max_discount) : null,
        is_valid: true,
        estimated_discount: Math.round(estimatedDiscount * 100) / 100,
        final_amount: Math.round(finalAmount * 100) / 100,
      },
    };
  }

  /**
   * Get cart with items
   */
  public async getCartWithItems(cartId: number | bigint): Promise<any> {
    const cartHeader = await this.cartRepository.findById(cartId);

    if (!cartHeader) {
      throw new NotFoundException('Cart not found');
    }

    const items = await this.cartItemRepository.findMany({
      cart_header_id: cartId,
    }, {
      include: { product: { include: { categories: true } } }
    } as any);

    return {
      ...cartHeader,
      items,
    };
  }
}