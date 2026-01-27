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
import { PublicShippingMethodService } from '../services/shipping-method.service';
import { CalculateShippingDto } from '../dtos/calculate-shipping.dto';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { prepareQuery } from '@/common/core/utils/list-query.helper';

@Controller('public/shipping-methods')
export class PublicShippingMethodController {
  constructor(private readonly shippingMethodService: PublicShippingMethodService) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filter, options } = prepareQuery(query);
    return this.shippingMethodService.getList({ ...filter, ...options });
  }

  @Permission('public')
  @Get('active')
  async getActive() {
    return this.shippingMethodService.findActive();
  }

  @Permission('public')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.shippingMethodService.getOne(id);
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