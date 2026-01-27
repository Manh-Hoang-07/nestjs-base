import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { PublicProductService } from '@/modules/ecommerce/public/product/services/product.service';
import { GetProductsDto } from '@/modules/ecommerce/public/product/dtos/get-products.dto';
import { GetProductDto } from '@/modules/ecommerce/public/product/dtos/get-product.dto';
import { Permission } from '@/common/decorators/rbac.decorators';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { ProductStatus } from '@/shared/enums/product-status.enum';

@Controller('public/products')
export class PublicProductController {
  constructor(private readonly productService: PublicProductService) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: GetProductsDto) {
    const { filters, options } = prepareQuery(query);
    return this.productService.getList(filters, options);
  }

  @Permission('public')
  @Get('featured')
  async getFeatured(@Query('limit') limit?: string) {
    const { filters, options } = prepareQuery({ is_featured: true, limit: limit ? parseInt(limit, 10) : 10 });
    return this.productService.getList(filters, options);
  }

  @Permission('public')
  @Get(':slug')
  async getBySlug(
    @Param('slug') slug: string,
    @Query(ValidationPipe) query: GetProductDto,
  ) {
    return this.productService.getOne(
      { slug, status: ProductStatus.ACTIVE },
      {
        select: ['id', 'name', 'slug', 'description', 'short_description', 'image', 'gallery', 'status', 'is_featured', 'is_variable', 'is_digital'],
        relations: [
          { name: 'variants', select: ['id', 'name', 'sku', 'price', 'sale_price', 'stock_quantity', 'weight', 'image', 'status'] },
          { name: 'categories', select: ['id', 'name', 'slug', 'description', 'image', 'icon', 'status', 'sort_order'] }
        ]
      });
  }

  @Permission('public')
  @Get(':id/variants')
  async getVariants(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductVariants(id);
  }

  @Permission('public')
  @Get('category/:slug')
  async getProductsByCategorySlug(
    @Param('slug') slug: string,
    @Query() query: any,
  ) {
    return this.productService.getProductsByCategorySlug(slug, query);
  }
}