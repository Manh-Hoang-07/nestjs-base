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
import { AdminProductService } from './services/product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { LogRequest } from '@/common/shared/decorators/log-request.decorator';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminProductController {
  constructor(private readonly productService: AdminProductService) { }

  @Get()
  @Permission('product.manage')
  async getList(@Query(ValidationPipe) query: any) {
    return this.productService.getList(query);
  }

  @Get('simple')
  @Permission('product.manage')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    return this.productService.getList(query);
  }

  @Get(':id')
  @Permission('product.manage')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getOne(id);
  }

  @LogRequest({ fileBaseName: 'admin_product_create' })
  @Post()
  @Permission('product.manage')
  async create(@Body(ValidationPipe) dto: CreateProductDto) {
    return this.productService.create(dto as any);
  }

  @LogRequest({ fileBaseName: 'admin_product_update' })
  @Put(':id')
  @Permission('product.manage')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto as any);
  }

  @LogRequest({ fileBaseName: 'admin_product_delete' })
  @Delete(':id')
  @Permission('product.manage')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productService.delete(id);
  }
}