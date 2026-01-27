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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RbacGuard } from '@/common/guards/rbac.guard';
import { Permission } from '@/common/decorators/rbac.decorators';
import { AdminShippingMethodService } from '@/modules/ecommerce/admin/shipping-method/services/shipping-method.service';
import { CreateShippingMethodDto } from '@/modules/ecommerce/admin/shipping-method/dtos/create-shipping-method.dto';
import { UpdateShippingMethodDto } from '@/modules/ecommerce/admin/shipping-method/dtos/update-shipping-method.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

@Controller('admin/shipping-methods')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminShippingMethodController {
  constructor(private readonly shippingMethodService: AdminShippingMethodService) { }

  @Get()
  @Permission('shipping_method.manage')
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.shippingMethodService.getList(filters, options);
  }

  @Get('simple')
  @Permission('shipping_method.manage')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.shippingMethodService.getSimpleList(filters, options);
  }

  @Get('active')
  @Permission('shipping_method.manage')
  async getActive() {
    return this.shippingMethodService.getList({ status: BasicStatus.Active }, { sort: 'name:ASC', limit: 1000 });
  }

  @Get('code/:code')
  @Permission('shipping_method.manage')
  async getByCode(@Param('code') code: string) {
    return this.shippingMethodService.getOne({ code } as any);
  }

  @Get(':id')
  @Permission('shipping_method.manage')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.shippingMethodService.getOne({ id } as any);
  }

  @LogRequest()
  @Post()
  @Permission('shipping_method.manage')
  async create(@Body(ValidationPipe) dto: CreateShippingMethodDto) {
    return this.shippingMethodService.create(dto as any);
  }

  @LogRequest()
  @Put(':id')
  @Permission('shipping_method.manage')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateShippingMethodDto,
  ) {
    return this.shippingMethodService.update(id, dto as any);
  }

  @LogRequest()
  @Put(':id/restore')
  @Permission('shipping_method.manage')
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.shippingMethodService.restore(id);
  }

  @LogRequest()
  @Delete(':id')
  @Permission('shipping_method.manage')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.shippingMethodService.delete(id);
  }
}