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
import { AdminProductAttributeValueService } from '@/modules/ecommerce/admin/product-attribute-value/services/product-attribute-value.service';
import { CreateProductAttributeValueDto } from '@/modules/ecommerce/admin/product-attribute-value/dtos/create-product-attribute-value.dto';
import { UpdateProductAttributeValueDto } from '@/modules/ecommerce/admin/product-attribute-value/dtos/update-product-attribute-value.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('admin/product-attribute-values')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminProductAttributeValueController {
  constructor(private readonly productAttributeValueService: AdminProductAttributeValueService) { }

  @Get()
  @Permission('product_attribute_value.manage')
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.productAttributeValueService.getList(filters, options);
  }

  @Get('simple')
  @Permission('product_attribute_value.manage')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.productAttributeValueService.getSimpleList(filters, options);
  }

  @Get('attribute/:attributeId')
  @Permission('product_attribute_value.manage')
  async getByAttributeId(@Param('attributeId', ParseIntPipe) attributeId: number) {
    return this.productAttributeValueService.findByAttributeId(attributeId);
  }

  @Get(':id')
  @Permission('product_attribute_value.manage')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.productAttributeValueService.getOne({ id } as any);
  }

  @LogRequest()
  @Post()
  @Permission('product_attribute_value.manage')
  async create(@Body(ValidationPipe) dto: CreateProductAttributeValueDto) {
    return this.productAttributeValueService.create(dto as any);
  }

  @LogRequest()
  @Put(':id')
  @Permission('product_attribute_value.manage')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateProductAttributeValueDto,
  ) {
    return this.productAttributeValueService.update(id, dto as any);
  }

  @LogRequest()
  @Put(':id/restore')
  @Permission('product_attribute_value.manage')
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.productAttributeValueService.restore(id);
  }

  @LogRequest()
  @Delete(':id')
  @Permission('product_attribute_value.manage')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productAttributeValueService.delete(id);
  }
}