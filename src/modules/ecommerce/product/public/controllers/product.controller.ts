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
  @Get(':slug')
  async getBySlug(
    @Param('slug') slug: string,
    @Query(ValidationPipe) query: GetProductDto,
  ) {
    return this.productService.getBySlug(slug);
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
  @Get(':id/variants')
  async getVariants(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductVariants(id);
  }
}