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
import { AdminProductAttributeValueService } from '../services/product-attribute-value.service';
import { CreateProductAttributeValueDto } from '../dtos/create-product-attribute-value.dto';
import { UpdateProductAttributeValueDto } from '../dtos/update-product-attribute-value.dto';
import { prepareQuery } from '@/common/core/utils/list-query.helper';
import { LogRequest } from '@/common/shared/decorators/log-request.decorator';

@Controller('admin/product-attribute-values')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminProductAttributeValueController {
  constructor(private readonly productAttributeValueService: AdminProductAttributeValueService) { }

  @Get()
  @Permission('product_attribute_value.manage')
  async getList(@Query(ValidationPipe) query: any) {
    return this.productAttributeValueService.getList(query);
  }

  @Get('simple')
  @Permission('product_attribute_value.manage')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    return this.productAttributeValueService.getSimpleList(query);
  }

  @Get('attribute/:attributeId')
  @Permission('product_attribute_value.manage')
  async getByAttributeId(@Param('attributeId', ParseIntPipe) attributeId: number) {
    return this.productAttributeValueService.findByAttributeId(attributeId);
  }

  @Get(':id')
  @Permission('product_attribute_value.manage')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.productAttributeValueService.getOne(id);
  }

  @LogRequest()
  @Post()
  @Permission('product_attribute_value.manage')
  async create(@Body(ValidationPipe) dto: CreateProductAttributeValueDto) {
    return this.productAttributeValueService.create(dto);
  }

  @LogRequest()
  @Put(':id')
  @Permission('product_attribute_value.manage')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateProductAttributeValueDto,
  ) {
    return this.productAttributeValueService.update(id, dto);
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