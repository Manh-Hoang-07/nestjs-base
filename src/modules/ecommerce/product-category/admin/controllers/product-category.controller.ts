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
import { JwtAuthGuard } from '@/common/auth/guards/jwt-auth.guard';
import { RbacGuard } from '@/common/auth/guards/rbac.guard';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { AdminProductCategoryService } from '../services/product-category.service';
import { CreateProductCategoryDto } from '../dtos/create-product-category.dto';
import { UpdateProductCategoryDto } from '../dtos/update-product-category.dto';
import { prepareQuery } from '@/common/core/utils/list-query.helper';
import { LogRequest } from '@/common/shared/decorators/log-request.decorator';

@Controller('admin/product-categories')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminProductCategoryController {
  constructor(private readonly productCategoryService: AdminProductCategoryService) { }

  @Get()
  @Permission('product_category.manage')
  async getList(@Query(ValidationPipe) query: any) {
    return this.productCategoryService.getList(query);
  }

  @Get('simple')
  @Permission('product_category.manage')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    return this.productCategoryService.getSimpleList(query);
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
    return this.productCategoryService.getOne(id);
  }

  @LogRequest()
  @Post()
  @Permission('product_category.manage')
  async create(@Body(ValidationPipe) dto: CreateProductCategoryDto) {
    return this.productCategoryService.create(dto);
  }

  @LogRequest()
  @Put(':id')
  @Permission('product_category.manage')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateProductCategoryDto,
  ) {
    return this.productCategoryService.update(id, dto);
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