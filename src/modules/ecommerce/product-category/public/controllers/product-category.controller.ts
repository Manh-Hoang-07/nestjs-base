import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  UseInterceptors,
} from '@nestjs/common';
import { PublicProductCategoryService } from '../services/product-category.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { CacheInterceptor, Cacheable } from '@/common/cache';

@Controller('public/product-categories')
@UseInterceptors(CacheInterceptor)
export class PublicProductCategoryController {
  constructor(private readonly productCategoryService: PublicProductCategoryService) { }

  @Permission('public')
  @Cacheable({ key: 'product-categories:list:${query.format}:${query.status}', ttl: 3600 })
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    return this.productCategoryService.getCategories(query);
  }

  @Permission('public')
  @Cacheable({ key: 'product-categories:tree', ttl: 3600 })
  @Get('tree')
  async getTree(@Query(ValidationPipe) query: any) {
    return this.productCategoryService.getCategories({ ...query, format: 'tree' });
  }

  @Permission('public')
  @Cacheable({ key: 'product-categories:root', ttl: 3600 })
  @Get('root')
  async getRoot(@Query(ValidationPipe) query: any) {
    return this.productCategoryService.getCategories({ ...query, format: 'tree' });
  }

  @Permission('public')
  @Cacheable({ key: 'product-categories:${id}:products:${query.page}:${query.limit}', ttl: 600 })
  @Get(':id/products')
  async getCategoryProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.productCategoryService.getCategoryProducts(id, { page, limit });
  }

  @Permission('public')
  @Cacheable({ key: 'product-categories:slug:${slug}', ttl: 3600 })
  @Get(':slug')
  async getBySlug(
    @Param('slug') slug: string,
    @Query(ValidationPipe) query: any,
  ) {
    return this.productCategoryService.getCategoryBySlug(slug, query);
  }
}