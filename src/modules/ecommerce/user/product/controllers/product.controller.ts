import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UserProductService } from '@/modules/ecommerce/user/product/services/product.service';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { ProductStatus } from '@/shared/enums/product-status.enum';
import { createPaginationMeta } from '@/common/base/utils/pagination.helper';

@Controller('user/products')
@UseGuards(JwtAuthGuard)
export class UserProductController {
  constructor(private readonly productService: UserProductService) { }

  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.productService.getProducts({ ...filters, ...options });
  }

  @Get('featured')
  async getFeatured(@Query('limit', ParseIntPipe) limit: number = 10) {
    return this.productService.getList(
      { status: ProductStatus.ACTIVE, is_featured: true },
      { sort: 'created_at:DESC', limit }
    );
  }

  @Get('search/:query')
  async search(
    @Param('query') searchQuery: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return this.productService.getList(
      { status: ProductStatus.ACTIVE },
      { page, limit, sort: 'created_at:DESC' }
    );
  }

  @Get('slug/:slug')
  async getBySlug(
    @Param('slug') slug: string,
    @Query(ValidationPipe) query: any,
  ) {
    return this.productService.getOne({ slug, status: ProductStatus.ACTIVE });
  }

  @Get(':id/variants')
  async getVariants(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductVariants(id);
  }

  @Get(':id/related')
  async getRelated(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', ParseIntPipe) limit: number = 5,
  ) {
    const result = await this.productService.getList(
      { status: ProductStatus.ACTIVE },
      { sort: 'created_at:DESC', limit: limit + 1 }
    );

    // Filter out current product
    const related = result.data.filter(p => p.id !== id).slice(0, limit);
    const total = related.length;
    const meta = createPaginationMeta(1, limit, total);
    return {
      data: related,
      meta,
    };
  }
}