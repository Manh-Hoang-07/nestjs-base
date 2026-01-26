import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  ValidationPipe,
  UseGuards,
  Request,
  Param,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Permission } from '@/common/decorators/rbac.decorators';
import { DiscountService } from '../services/discount.service';
import { PublicCartService } from '../../cart/services/cart.service';
import { ApplyCouponDto } from '../dtos/apply-coupon.dto';
import { ValidateCouponDto } from '../dtos/validate-coupon.dto';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('public/discounts')
export class PublicDiscountController {
  constructor(
    private readonly discountService: DiscountService,
    @Inject(forwardRef(() => PublicCartService))
    private readonly cartService: PublicCartService,
  ) {}

  @Get('coupons/available')
  @Permission('public')
  async getAvailableCoupons(@Request() req: any) {
    const userId = req.user?.id;
    return this.discountService.getAvailableCoupons(userId);
  }

  @LogRequest()
  @Post('apply-coupon')
  @UseGuards(JwtAuthGuard)
  @Permission('public')
  async applyCoupon(
    @Request() req: any,
    @Body(ValidationPipe) dto: ApplyCouponDto,
  ) {
    const userId = req.user?.id;
    
    // Get cart by ID or UUID
    let cartHeader;
    if (dto.cart_id) {
      // Find cart by ID with relations
      cartHeader = await this.cartService.getCartByIdWithRelations(dto.cart_id);
    } else if (dto.cart_uuid) {
      cartHeader = await this.cartService.getOrCreateCart(undefined, dto.cart_uuid, userId);
    } else {
      throw new Error('Cần cung cấp cart_id hoặc cart_uuid');
    }
    
    if (!cartHeader) {
      throw new Error('Không tìm thấy giỏ hàng');
    }
    
    // 1. Calculate discount using DiscountService
    const discountInfo = await this.discountService.calculateCouponDiscount(
      cartHeader.id,
      dto.coupon_code,
      userId,
    );
    
    // 2. Apply discount to cart using CartService
    const updatedCart = await this.cartService.applyDiscount(cartHeader.id, {
      discountAmount: discountInfo.discountAmount,
      couponCode: discountInfo.coupon.code,
      couponId: discountInfo.coupon.id,
    });
    
    // 3. Return formatted response
    return {
      message: 'Áp dụng mã giảm giá thành công',
      data: {
        cart_id: cartHeader.id,
        cart_uuid: cartHeader.uuid,
        subtotal: parseFloat(updatedCart.subtotal),
        discount_amount: discountInfo.discountAmount,
        coupon_code: updatedCart.coupon_code,
        shipping_amount: parseFloat(updatedCart.shipping_amount),
        tax_amount: parseFloat(updatedCart.tax_amount),
        total_amount: parseFloat(updatedCart.total_amount),
        applied_coupon: {
          id: discountInfo.coupon.id,
          code: discountInfo.coupon.code,
          name: discountInfo.coupon.name,
          discount_type: discountInfo.coupon.discount_type,
          discount_value: discountInfo.coupon.discount_value,
          discount_amount: discountInfo.discountAmount,
        },
        items: updatedCart.items.map((item: any) => ({
          id: item.id,
          product_name: item.product?.name || 'Product',
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          total_price: parseFloat(item.total_price),
        })),
      },
    };
  }

  @LogRequest()
  @Delete('remove-coupon/:cart_id')
  @UseGuards(JwtAuthGuard)
  @Permission('public')
  async removeCoupon(
    @Request() req: any,
    @Param('cart_id') cartId: string,
  ) {
    const userId = req.user?.id;
    
    // Check if cartId is a number (ID) or UUID
    let cartHeader;
    if (/^\d+$/.test(cartId)) {
      // It's a numeric ID - get cart by ID with relations
      cartHeader = await this.cartService.getCartByIdWithRelations(parseInt(cartId));
    } else {
      // It's a UUID
      cartHeader = await this.cartService.getOrCreateCart(undefined, cartId, userId);
    }
    
    if (!cartHeader) {
      throw new Error('Không tìm thấy giỏ hàng');
    }
    
    // 1. Remove discount from cart using CartService
    const updatedCart = await this.cartService.removeDiscount(cartHeader.id);
    
    // 2. Return formatted response
    return {
      message: 'Xóa mã giảm giá thành công',
      data: {
        cart_id: cartHeader.id,
        cart_uuid: cartHeader.uuid,
        subtotal: parseFloat(updatedCart.subtotal),
        discount_amount: 0,
        coupon_code: null,
        shipping_amount: parseFloat(updatedCart.shipping_amount),
        tax_amount: parseFloat(updatedCart.tax_amount),
        total_amount: parseFloat(updatedCart.total_amount),
        items: updatedCart.items.map((item: any) => ({
          id: item.id,
          product_name: item.product?.name || 'Product',
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          total_price: parseFloat(item.total_price),
        })),
      },
    };
  }

  @Post('validate-coupon')
  @Permission('public')
  async validateCoupon(
    @Request() req: any,
    @Body(ValidationPipe) dto: ValidateCouponDto,
  ) {
    const userId = req.user?.id;
    return this.discountService.validateCouponCode(
      dto.coupon_code,
      dto.cart_total,
      userId,
    );
  }
}