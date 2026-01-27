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
import { UserProductCategoryService } from '../services/product-category.service';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { prepareQuery } from '@/common/core/utils/list-query.helper';

@Controller('user/product-categories')
@UseGuards(JwtAuthGuard)
export class UserProductCategoryController {
  constructor(private readonly productCategoryService: UserProductCategoryService) { }

  @Get()
  @Permission('public')
  async getList(@Query(ValidationPipe) query: any) {
    const { filter, options } = prepareQuery(query);
    return this.productCategoryService.getCategories({ ...filter, ...options });
  }

  @Get('tree')
  @Permission('public')
  async getTree(@Query(ValidationPipe) query: any) {
    const { filter, options } = prepareQuery(query);
    const treeDto = { ...filter, ...options, format: 'tree' as 'tree' | 'flat' };
    return this.productCategoryService.getCategories(treeDto);
  }

  @Get('root')
  @Permission('public')
  async getRoot(@Query(ValidationPipe) query: any) {
    const { filter, options } = prepareQuery(query);
    const rootDto = { ...filter, ...options, format: 'tree' as 'tree' | 'flat' };
    return this.productCategoryService.getCategories(rootDto);
  }

  @Get(':id/products')
  @Permission('public')
  async getCategoryProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.productCategoryService.getCategoryProducts(id, { page, limit });
  }

  @Get(':id')
  @Permission('public')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.productCategoryService.getOne(id);
  }
}