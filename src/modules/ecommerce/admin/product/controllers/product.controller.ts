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
import { AdminProductService } from '@/modules/ecommerce/admin/product/services/product.service';
import { CreateProductDto } from '@/modules/ecommerce/admin/product/dtos/create-product.dto';
import { UpdateProductDto } from '@/modules/ecommerce/admin/product/dtos/update-product.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminProductController {
  constructor(private readonly productService: AdminProductService) { }

  @Get()
  @Permission('product.manage')
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.productService.getList(filters, options);
  }

  @Get('simple')
  @Permission('product.manage')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.productService.getSimpleList(filters, options);
  }

  @Get(':id')
  @Permission('product.manage')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getOne({ id }, {
      relations: [
        'variants',
        'categories',
      ]
    });
  }

  @LogRequest({ fileBaseName: 'admin_product_create' })
  @Post()
  @Permission('product.manage')
  async create(@Body(ValidationPipe) dto: CreateProductDto) {
    return this.productService.create(dto as any);
  }

  @LogRequest({ fileBaseName: 'admin_product_update' })
  @Put(':id')
  @Permission('product.manage')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto as any);
  }

  @LogRequest({ fileBaseName: 'admin_product_delete' })
  @Delete(':id')
  @Permission('product.manage')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productService.delete(id);
  }
}