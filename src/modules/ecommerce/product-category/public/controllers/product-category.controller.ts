import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { PublicProductCategoryService } from '../services/product-category.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';

@Controller('public/product-categories')
export class PublicProductCategoryController {
  constructor(private readonly productCategoryService: PublicProductCategoryService) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    return this.productCategoryService.getCategories(query);
  }

  @Permission('public')
  @Get('tree')
  async getTree(@Query(ValidationPipe) query: any) {
    return this.productCategoryService.getCategories({ ...query, format: 'tree' });
  }

  @Permission('public')
  @Get('root')
  async getRoot(@Query(ValidationPipe) query: any) {
    return this.productCategoryService.getCategories({ ...query, format: 'tree' });
  }

  @Permission('public')
  @Get(':id/products')
  async getCategoryProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.productCategoryService.getCategoryProducts(id, { page, limit });
  }

  @Permission('public')
  @Get(':slug')
  async getBySlug(
    @Param('slug') slug: string,
    @Query(ValidationPipe) query: any,
  ) {
    return this.productCategoryService.getCategoryBySlug(slug, query);
  }
}