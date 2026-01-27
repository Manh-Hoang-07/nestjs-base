import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { PublicProductCategoryService } from '@/modules/ecommerce/public/product-category/services/product-category.service';
import { Permission } from '@/common/decorators/rbac.decorators';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Controller('public/product-categories')
export class PublicProductCategoryController {
  constructor(private readonly productCategoryService: PublicProductCategoryService) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.productCategoryService.getCategories({ ...filters, ...options });
  }

  @Permission('public')
  @Get('tree')
  async getTree(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    const treeDto = { ...filters, ...options, format: 'tree' as 'tree' | 'flat' };
    return this.productCategoryService.getCategories(treeDto);
  }

  @Permission('public')
  @Get('root')
  async getRoot(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    const rootDto = { ...filters, ...options, format: 'tree' as 'tree' | 'flat' };
    return this.productCategoryService.getCategories(rootDto);
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