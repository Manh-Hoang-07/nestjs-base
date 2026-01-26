import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RbacGuard } from '@/common/guards/rbac.guard';
import { Permission } from '@/common/decorators/rbac.decorators';
import { AdminProductCategoryService } from '@/modules/ecommerce/admin/product-category/services/product-category.service';
import { CreateProductCategoryDto } from '@/modules/ecommerce/admin/product-category/dtos/create-product-category.dto';
import { UpdateProductCategoryDto } from '@/modules/ecommerce/admin/product-category/dtos/update-product-category.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('admin/product-categories')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminProductCategoryController {
  constructor(private readonly productCategoryService: AdminProductCategoryService) { }

  @Get()
  @Permission('product_category.manage')
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.productCategoryService.getList(filters, options);
  }

  @Get('simple')
  @Permission('product_category.manage')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.productCategoryService.getSimpleList(filters, options);
  }

  @Get('tree')
  @Permission('product_category.manage')
  async getTree() {
    return this.productCategoryService.findTree();
  }

  @Get('root')
  @Permission('product_category.manage')
  async getRootCategories() {
    return this.productCategoryService.findRootCategories();
  }

  @Get(':id/children')
  @Permission('product_category.manage')
  async getChildren(@Param('id', ParseIntPipe) id: number) {
    return this.productCategoryService.findChildren(id);
  }

  @Get(':id')
  @Permission('product_category.manage')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.productCategoryService.getOne({ id } as any);
  }

  @LogRequest()
  @Post()
  @Permission('product_category.manage')
  async create(@Body(ValidationPipe) dto: CreateProductCategoryDto) {
    return this.productCategoryService.create(dto as any);
  }

  @LogRequest()
  @Put(':id')
  @Permission('product_category.manage')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateProductCategoryDto,
  ) {
    return this.productCategoryService.update(id, dto as any);
  }

  @LogRequest()
  @Put(':id/restore')
  @Permission('product_category.manage')
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.productCategoryService.restore(id);
  }

  @LogRequest()
  @Delete(':id')
  @Permission('product_category.manage')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productCategoryService.delete(id);
  }
}