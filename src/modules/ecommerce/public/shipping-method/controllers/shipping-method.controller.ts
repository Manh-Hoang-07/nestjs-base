import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { PublicShippingMethodService } from '@/modules/ecommerce/public/shipping-method/services/shipping-method.service';
import { CalculateShippingDto } from '@/modules/ecommerce/public/shipping-method/dtos/calculate-shipping.dto';
import { Permission } from '@/common/decorators/rbac.decorators';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Controller('public/shipping-methods')
export class PublicShippingMethodController {
  constructor(private readonly shippingMethodService: PublicShippingMethodService) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.shippingMethodService.getList(filters, options);
  }

  @Permission('public')
  @Get('active')
  async getActive() {
    return this.shippingMethodService.findActive();
  }

  @Permission('public')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.shippingMethodService.getOne({ id: id });
  }

  @Permission('public')
  @Post('calculate')
  async calculateShipping(@Body(ValidationPipe) dto: CalculateShippingDto) {
    return this.shippingMethodService.calculateShippingCost(
      dto.shipping_method_id,
      dto.cart_value,
      dto.weight,
      dto.destination
    );
  }
}