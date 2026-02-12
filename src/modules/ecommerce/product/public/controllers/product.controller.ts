import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { PublicProductService } from '../services/product.service';
import { GetProductsDto } from '../dtos/get-products.dto';
import { GetProductDto } from '../dtos/get-product.dto';
import { createPaginationMeta } from '@/common/core/utils/pagination.helper';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('public/products')
export class PublicProductController {
  constructor(private readonly productService: PublicProductService) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: GetProductsDto) {
    return this.productService.getList(query);
  }

  @Permission('public')
  @Get('featured')
  async getFeatured(@Query('limit') limit?: string) {
    const query = { is_featured: true, limit: limit ? parseInt(limit, 10) : 10 };
    return this.productService.getList(query);
  }

  @Permission('public')
  @Get('category/:slug')
  async getProductsByCategorySlug(
    @Param('slug') slug: string,
    @Query() query: any,
  ) {
    return this.productService.getList({ ...query, category_slug: slug });
  }

  @Permission('public')
  @Get(':slug/related')
  async getRelated(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 5;

    // First get the current product with categories
    const currentProduct: any = await this.productService.getBySlug(slug);

    if (!currentProduct) {
      return { data: [], meta: createPaginationMeta(1, limitNum, 0) };
    }

    // Get products, preferably from the same category if available
    const query: any = { limit: limitNum + 10 }; // Get more to filter

    // If product has categories, try to filter by the first category
    if (currentProduct.categories && currentProduct.categories.length > 0) {
      const firstCategoryId = currentProduct.categories[0].id;
      query.category_id = firstCategoryId;
    }

    const result = await this.productService.getList(query);

    // Filter out current product and limit results
    const related = result.data
      .filter((p: any) => p.id !== currentProduct.id)
      .slice(0, limitNum);

    const total = related.length;
    const meta = createPaginationMeta(1, limitNum, total);

    return {
      data: related,
      meta,
    };
  }

  @Permission('public')
  @Get(':id/variants')
  async getVariants(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductVariants(id);
  }

  @Permission('public')
  @Get(':slug')
  async getBySlug(
    @Param('slug') slug: string,
    @Query(ValidationPipe) query: GetProductDto,
  ) {
    return this.productService.getBySlug(slug);
  }
}