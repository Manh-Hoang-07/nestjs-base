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
import { UserProductCategoryService } from '@/modules/ecommerce/user/product-category/services/product-category.service';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Controller('user/product-categories')
@UseGuards(JwtAuthGuard)
export class UserProductCategoryController {
  constructor(private readonly productCategoryService: UserProductCategoryService) { }

  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.productCategoryService.getCategories({ ...filters, ...options });
  }

  @Get('tree')
  async getTree(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    const treeDto = { ...filters, ...options, format: 'tree' as 'tree' | 'flat' };
    return this.productCategoryService.getCategories(treeDto);
  }

  @Get('root')
  async getRoot(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    const rootDto = { ...filters, ...options, format: 'tree' as 'tree' | 'flat' };
    return this.productCategoryService.getCategories(rootDto);
  }

  @Get(':id/products')
  async getCategoryProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.productCategoryService.getCategoryProducts(id, { page, limit });
  }

  @Get(':slug')
  async getBySlug(
    @Param('slug') slug: string,
    @Query(ValidationPipe) query: any,
  ) {
    return this.productCategoryService.getOne({ slug, status: BasicStatus.Active });
  }
}