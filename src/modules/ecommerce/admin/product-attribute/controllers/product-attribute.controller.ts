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
import { AdminProductAttributeService } from '@/modules/ecommerce/admin/product-attribute/services/product-attribute.service';
import { CreateProductAttributeDto } from '@/modules/ecommerce/admin/product-attribute/dtos/create-product-attribute.dto';
import { UpdateProductAttributeDto } from '@/modules/ecommerce/admin/product-attribute/dtos/update-product-attribute.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('admin/product-attributes')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminProductAttributeController {
  constructor(private readonly productAttributeService: AdminProductAttributeService) { }

  @Get()
  @Permission('product_attribute.manage')
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.productAttributeService.getList(filters, options);
  }

  @Get('simple')
  @Permission('product_attribute.manage')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.productAttributeService.getSimpleList(filters, options);
  }

  @Get('with-values')
  @Permission('product_attribute.manage')
  async getWithValues() {
    return this.productAttributeService.getList({}, { relations: ['values'], limit: 1000 });
  }

  @Get('code/:code')
  @Permission('product_attribute.manage')
  async getByCode(@Param('code') code: string) {
    return this.productAttributeService.getOne({ code } as any);
  }

  @Get(':id')
  @Permission('product_attribute.manage')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.productAttributeService.getOne({ id } as any);
  }

  @LogRequest()
  @Post()
  @Permission('product_attribute.manage')
  async create(@Body(ValidationPipe) dto: CreateProductAttributeDto) {
    return this.productAttributeService.create(dto as any);
  }

  @LogRequest()
  @Put(':id')
  @Permission('product_attribute.manage')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateProductAttributeDto,
  ) {
    return this.productAttributeService.update(id, dto as any);
  }

  @LogRequest()
  @Put(':id/restore')
  @Permission('product_attribute.manage')
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.productAttributeService.restore(id);
  }

  @LogRequest()
  @Delete(':id')
  @Permission('product_attribute.manage')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productAttributeService.delete(id);
  }
}