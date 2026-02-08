import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/auth/guards/jwt-auth.guard';
import { UserProductService } from '../services/product.service';
import { ProductStatus } from '@/shared/enums';
import { createPaginationMeta } from '@/common/core/utils/pagination.helper';

@Controller('user/products')
@UseGuards(JwtAuthGuard)
export class UserProductController {
  constructor(private readonly productService: UserProductService) { }

  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    return this.productService.getProducts(query);
  }

  @Get('featured')
  async getFeatured(@Query('limit', ParseIntPipe) limit: number = 10) {
    return this.productService.getList(
      { status: ProductStatus.active, is_featured: true, sort: 'created_at:DESC', limit }
    );
  }

  @Get('search/:query')
  async search(
    @Param('query') searchQuery: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return this.productService.getList(
      { status: ProductStatus.active, page, limit, sort: 'created_at:DESC' }
    );
  }

  @Get('slug/:slug')
  async getBySlug(
    @Param('slug') slug: string,
    @Query(ValidationPipe) query: any,
  ) {
    // Use repository method to find by slug
    return (this.productService as any).productRepository.findBySlug(slug);
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
      { status: ProductStatus.active, sort: 'created_at:DESC', limit: limit + 1 }
    );

    // Filter out current product
    const related = result.data.filter((p: any) => p.id !== id).slice(0, limit);
    const total = related.length;
    const meta = createPaginationMeta(1, limit, total);
    return {
      data: related,
      meta,
    };
  }
}