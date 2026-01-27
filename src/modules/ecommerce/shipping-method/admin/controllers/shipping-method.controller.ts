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
import { JwtAuthGuard } from '@/common/auth/guards/jwt-auth.guard';
import { RbacGuard } from '@/common/auth/guards/rbac.guard';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { AdminShippingMethodService } from '../services/shipping-method.service';
import { CreateShippingMethodDto } from '../dtos/create-shipping-method.dto';
import { UpdateShippingMethodDto } from '../dtos/update-shipping-method.dto';
import { prepareQuery } from '@/common/core/utils/list-query.helper';
import { LogRequest } from '@/common/shared/decorators/log-request.decorator';
import { BasicStatus } from '@/shared/enums';

@Controller('admin/shipping-methods')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminShippingMethodController {
  constructor(private readonly shippingMethodService: AdminShippingMethodService) { }

  @Get()
  @Permission('shipping_method.manage')
  async getList(@Query(ValidationPipe) query: any) {
    const { filter, options } = prepareQuery(query);
    return this.shippingMethodService.getList({ ...filter, ...options });
  }

  @Get('simple')
  @Permission('shipping_method.manage')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    const { filter, options } = prepareQuery(query);
    return this.shippingMethodService.getList({ ...filter, ...options });
  }

  @Get('active')
  @Permission('shipping_method.manage')
  async getActive() {
    return this.shippingMethodService.getList({ status: BasicStatus.active, sort: 'name:ASC', limit: 1000 });
  }

  @Get('code/:code')
  @Permission('shipping_method.manage')
  async getByCode(@Param('code') code: string) {
    // BaseService doesn't have getOne by code easily unless we use findOne via repository or custom method
    // Assuming repository has findByCode
    return (this.shippingMethodService as any).shippingMethodRepository.findByCode(code);
  }

  @Get(':id')
  @Permission('shipping_method.manage')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.shippingMethodService.getOne(id);
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