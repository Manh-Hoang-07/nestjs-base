import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { PublicCartService } from '@/modules/ecommerce/public/cart/services/cart.service';
import { AddToCartDto } from '@/modules/ecommerce/public/cart/dtos/add-to-cart.dto';
import { UpdateCartItemDto } from '@/modules/ecommerce/public/cart/dtos/update-cart-item.dto';
import { Permission } from '@/common/decorators/rbac.decorators';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Auth } from '@/common/utils/auth.util';

@Controller('public/cart')
export class PublicCartController {
  constructor(private readonly cartService: PublicCartService) { }

  @Permission('public')
  @Get()
  async getCart(
    @Query('cart_uuid') cartUuid?: string,
  ) {
    const userId = Auth.id() || undefined;
    return this.cartService.getCartSummary(undefined, cartUuid, userId);
  }

  @LogRequest()
  @Permission('public')
  @Post('add')
  async addToCart(
    @Body(ValidationPipe) dto: AddToCartDto,
  ) {
    const userId = Auth.id() || undefined;
    return this.cartService.addToCart(
      dto.product_variant_id,
      dto.quantity,
      undefined,
      dto.cart_uuid,
      userId,
    );
  }

  @LogRequest()
  @Permission('public')
  @Put('update')
  async updateCartItem(
    @Body(ValidationPipe) dto: UpdateCartItemDto,
  ) {
    const userId = Auth.id() || undefined;
    return this.cartService.updateCartItem(
      dto.cart_item_id,
      dto.quantity,
      undefined,
      dto.cart_uuid,
      userId,
    );
  }

  @LogRequest()
  @Permission('public')
  @Put('items/:id')
  async updateCartItemById(
    @Param('id', ParseIntPipe) cartItemId: number,
    @Body(ValidationPipe) dto: Partial<UpdateCartItemDto>,
    @Query('cart_uuid') cartUuid?: string,
  ) {
    const userId = Auth.id() || undefined;
    return this.cartService.updateCartItem(
      cartItemId,
      dto.quantity!,
      undefined,
      cartUuid,
      userId,
    );
  }

  @LogRequest()
  @Permission('public')
  @Delete('item/:id')
  async removeFromCart(
    @Param('id', ParseIntPipe) cartItemId: number,
    @Query('cart_uuid') cartUuid?: string,
  ) {
    const userId = Auth.id() || undefined;
    return this.cartService.removeFromCart(cartItemId, undefined, cartUuid, userId);
  }

  @LogRequest()
  @Permission('public')
  @Delete('clear')
  async clearCart(
    @Query('cart_uuid') cartUuid?: string,
  ) {
    const userId = Auth.id() || undefined;
    return this.cartService.clearCart(undefined, cartUuid, userId);
  }

  @Permission('public')
  @Get('summary')
  async getCartSummary(
    @Query('cart_uuid') cartUuid?: string,
  ) {
    const userId = Auth.id() || undefined;
    return this.cartService.getCartSummary(undefined, cartUuid, userId);
  }
}