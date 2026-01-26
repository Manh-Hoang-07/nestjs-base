import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon, CouponType, CouponStatus } from '@/shared/entities/coupon.entity';
import { CouponUsage } from '@/shared/entities/coupon-usage.entity';
import { Order } from '@/shared/entities/order.entity';
import { CartHeader } from '@/shared/entities/cart-header.entity';
import { Cart } from '@/shared/entities/cart.entity';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private readonly couponUsageRepository: Repository<CouponUsage>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(CartHeader)
    private readonly cartHeaderRepository: Repository<CartHeader>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  /**
   * Calculate discount for coupon (without applying to cart)
   */
  async calculateCouponDiscount(
    cartId: number,
    couponCode: string,
    userId?: number,
  ): Promise<any> {
    // 1. Find coupon
    const coupon = await this.couponRepository.findOne({
      where: { code: couponCode, status: CouponStatus.ACTIVE },
    });

    if (!coupon) {
      throw new BadRequestException('Invalid coupon code');
    }

    // 2. Validate coupon
    await this.validateCoupon(coupon, userId);

    // 3. Calculate discount
    const cart = await this.getCartWithItems(cartId);
    const discountAmount = await this.calculateDiscount(coupon, cart);
    
    return {
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discount_type: coupon.type,
        discount_value: parseFloat(coupon.value as string || '0'),
      },
      discountAmount,
      cart,
    };
  }

  /**
   * Validate coupon eligibility
   */
  private async validateCoupon(coupon: Coupon, userId?: number): Promise<void> {
    const now = new Date();

    // Check dates
    if (now < coupon.start_date) {
      throw new BadRequestException('Coupon not yet valid');
    }
    if (now > coupon.end_date) {
      throw new BadRequestException('Coupon has expired');
    }

    // Check total usage limit
    if (coupon.usage_limit && (coupon.used_count || 0) >= coupon.usage_limit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    // Check per-user usage limit
    if (userId) {
      const userUsageCount = await this.couponUsageRepository.count({
        where: { coupon_id: coupon.id, user_id: userId },
      });

      if (userUsageCount >= coupon.usage_per_customer) {
        throw new BadRequestException('You have reached the usage limit for this coupon');
      }

      // Check first order only
      if (coupon.first_order_only) {
        const orderCount = await this.orderRepository.count({
          where: { user_id: userId },
        });
        if (orderCount > 0) {
          throw new BadRequestException('This coupon is only valid for first orders');
        }
      }
    }
  }

  /**
   * Calculate discount amount
   */
  private async calculateDiscount(coupon: Coupon, cart: any): Promise<number> {
    const subtotal = parseFloat(cart.subtotal || '0');

    // Check minimum order value
    const minOrderValue = parseFloat(coupon.min_order_value || '0');
    if (subtotal < minOrderValue) {
      throw new BadRequestException(
        `Minimum order value is ${minOrderValue}`
      );
    }

    // Filter applicable items
    const applicableItems = this.filterApplicableItems(
      cart.items,
      coupon.applicable_products || undefined,
      coupon.applicable_categories || undefined,
      coupon.excluded_products || undefined,
    );

    if (applicableItems.length === 0) {
      throw new BadRequestException('No applicable products in cart');
    }

    const applicableTotal = applicableItems.reduce(
      (sum, item) => sum + parseFloat(item.total_price),
      0,
    );

    let discountAmount = 0;

    switch (coupon.type) {
      case CouponType.PERCENTAGE:
        discountAmount = (applicableTotal * parseFloat(coupon.value || '0')) / 100;
        break;

      case CouponType.FIXED_AMOUNT:
        discountAmount = Math.min(parseFloat(coupon.value || '0'), applicableTotal);
        break;

      case CouponType.FREE_SHIPPING:
        discountAmount = parseFloat(cart.shipping_amount || '0');
        break;
    }

    // Apply max discount limit
    if (coupon.max_discount_amount) {
      discountAmount = Math.min(
        discountAmount,
        parseFloat(coupon.max_discount_amount || '0'),
      );
    }

    return Math.round(discountAmount * 100) / 100;
  }

  /**
   * Filter items based on coupon rules
   */
  private filterApplicableItems(
    items: any[],
    applicableProducts?: number[],
    applicableCategories?: number[],
    excludedProducts?: number[],
  ): any[] {
    return items.filter(item => {
      // Check excluded products
      if (excludedProducts && excludedProducts.includes(item.product_id)) {
        return false;
      }

      // If no restrictions, all items are applicable
      if (!applicableProducts && !applicableCategories) {
        return true;
      }

      // Check applicable products
      if (applicableProducts && applicableProducts.includes(item.product_id)) {
        return true;
      }

      // Check applicable categories
      if (applicableCategories && item.product?.categories) {
        return item.product.categories.some((cat: any) =>
          applicableCategories.includes(cat.id),
        );
      }

      return false;
    });
  }

  /**
   * Record coupon usage
   */
  async recordCouponUsage(
    couponId: number,
    userId: number,
    orderId: number,
    discountAmount: number,
    orderTotal: number,
  ): Promise<void> {
    // Create usage record
    await this.couponUsageRepository.save({
      coupon_id: couponId,
      user_id: userId,
      order_id: orderId,
      discount_amount: discountAmount.toString(),
      order_total: orderTotal.toString(),
    });

    // Increment coupon used_count
    await this.couponRepository.increment({ id: couponId }, 'used_count', 1);
  }

  /**
   * Get available coupons for user
   */
  async getAvailableCoupons(userId?: number): Promise<any> {
    const now = new Date();

    const query = this.couponRepository
      .createQueryBuilder('coupon')
      .where('coupon.status = :status', { status: CouponStatus.ACTIVE })
      .andWhere('coupon.start_date <= :now', { now })
      .andWhere('coupon.end_date >= :now', { now })
      .andWhere('(coupon.usage_limit IS NULL OR (coupon.used_count || 0) < coupon.usage_limit)');

    if (userId) {
      // Get coupons user has already maxed out
      const usedCoupons = await this.couponUsageRepository
        .createQueryBuilder('usage')
        .select('usage.coupon_id', 'coupon_id')
        .addSelect('COUNT(*)', 'count')
        .addSelect('coupon.usage_per_customer', 'usage_per_customer')
        .innerJoin('usage.coupon', 'coupon')
        .where('usage.user_id = :userId', { userId })
        .groupBy('usage.coupon_id')
        .addGroupBy('coupon.usage_per_customer')
        .having('COUNT(*) >= coupon.usage_per_customer')
        .getRawMany();

      if (usedCoupons.length > 0) {
        query.andWhere('coupon.id NOT IN (:...usedIds)', {
          usedIds: usedCoupons.map(u => u.coupon_id),
        });
      }
    }

    const coupons = await query.getMany();
    
    // Transform response to match API documentation
    const transformedCoupons = coupons.map((coupon: any) => ({
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discount_type: coupon.type,
      discount_value: parseFloat(coupon.value as string || '0'),
      minimum_order_amount: parseFloat(coupon.min_order_value as string || '0'),
      maximum_discount_amount: coupon.max_discount_amount ? parseFloat(coupon.max_discount_amount as string || '0') : null,
      usage_limit: coupon.usage_limit,
      usage_count: coupon.used_count || 0,
      start_date: coupon.start_date,
      end_date: coupon.end_date,
      is_active: coupon.status === 'active',
      applicable_for: 'all', // Default value
      user_usage_count: 0, // Will be calculated if userId is provided
      can_use: true, // Will be calculated based on user usage
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
    userId?: number,
  ): Promise<any> {
    // 1. Find coupon
    const coupon = await this.couponRepository.findOne({
      where: { code: couponCode, status: CouponStatus.ACTIVE },
    });

    if (!coupon) {
      throw new BadRequestException('Mã giảm giá không tồn tại');
    }

    // 2. Validate coupon
    await this.validateCoupon(coupon, userId);

    // 3. Calculate estimated discount
    let estimatedDiscount = 0;
    let finalAmount = cartTotal || 0;

    if (cartTotal) {
      // Check minimum order value
      const minOrderValue = parseFloat(coupon.min_order_value || '0');
      if (cartTotal < minOrderValue) {
        throw new BadRequestException(
          `Đơn hàng tối thiểu phải đạt ${minOrderValue}đ để sử dụng mã này`
        );
      }

      // Calculate discount based on type
      switch (coupon.type) {
        case CouponType.PERCENTAGE:
          estimatedDiscount = (cartTotal * parseFloat(coupon.value || '0')) / 100;
          break;
        case CouponType.FIXED_AMOUNT:
          estimatedDiscount = Math.min(parseFloat(coupon.value || '0'), cartTotal);
          break;
        case CouponType.FREE_SHIPPING:
          estimatedDiscount = 0; // Shipping discount handled separately
          break;
      }

      // Apply max discount limit
      if (coupon.max_discount_amount) {
        estimatedDiscount = Math.min(
          estimatedDiscount,
          parseFloat(coupon.max_discount_amount || '0'),
        );
      }

      finalAmount = cartTotal - estimatedDiscount;
    }

    // Get user usage count
    let userUsageCount = 0;
    if (userId) {
      userUsageCount = await this.couponUsageRepository.count({
        where: { coupon_id: coupon.id, user_id: userId },
      });
    }

    return {
      message: 'Mã giảm giá hợp lệ',
      data: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discount_type: coupon.type,
        discount_value: parseFloat(coupon.value || '0'),
        minimum_order_amount: parseFloat(coupon.min_order_value || '0'),
        maximum_discount_amount: coupon.max_discount_amount ? parseFloat(coupon.max_discount_amount || '0') : null,
        is_valid: true,
        estimated_discount: Math.round(estimatedDiscount * 100) / 100,
        final_amount: Math.round(finalAmount * 100) / 100,
        user_usage_count: userUsageCount,
        remaining_usage: coupon.usage_limit ? (coupon.usage_limit - (coupon.used_count || 0)) : null,
      },
    };
  }


  /**
   * Get cart with items for discount calculation
   */
  public async getCartWithItems(cartId: number): Promise<any> {
    const cartHeader = await this.cartHeaderRepository.findOne({
      where: { id: cartId },
    });

    if (!cartHeader) {
      throw new NotFoundException('Cart not found');
    }

    const items = await this.cartRepository.find({
      where: { cart_header_id: cartId },
      relations: ['product', 'product.categories'],
    });

    return {
      ...cartHeader,
      items,
    };
  }

}