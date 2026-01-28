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
import { AdminProductVariantService } from '../services/product-variant.service';
import { CreateProductVariantDto } from '../dtos/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dtos/update-product-variant.dto';
import { SearchVariantsDto } from '../dtos/search-variants.dto';
import { prepareQuery } from '@/common/core/utils/list-query.helper';
import { LogRequest } from '@/common/shared/decorators/log-request.decorator';

@Controller('admin/product-variants')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminProductVariantController {
  constructor(private readonly productVariantService: AdminProductVariantService) { }

  @Get()
  @Permission('product_variant.manage')
  async getList(@Query(ValidationPipe) query: any) {
    const { filter, options } = prepareQuery(query);
    const includeAttributes = query?.include_attributes === 'true' || query?.include_attributes === true;
    return this.productVariantService.getList({
      ...filter,
      ...options,
      ...(includeAttributes
        ? { include: this.productVariantService.getAttributesInclude() }
        : { select: this.productVariantService.getDefaultSelect() }),
    });
  }

  @Get('simple')
  @Permission('product_variant.manage')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    const { filter, options } = prepareQuery(query);
    return this.productVariantService.getList({ ...filter, ...options, select: this.productVariantService.getSimpleSelect() });
  }

  @Get('product/:productId')
  @Permission('product_variant.manage')
  async getByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('include_attributes') includeAttributes?: string,
  ) {
    return this.productVariantService.getList(
      {
        product_id: productId,
        sort: 'created_at:DESC',
        limit: 1000,
        ...(includeAttributes === 'true'
          ? { include: this.productVariantService.getAttributesInclude() }
          : { select: this.productVariantService.getDefaultSelect() }),
      }
    );
  }

  @Post('search')
  @Permission('product_variant.manage')
  async searchVariants(@Body(ValidationPipe) searchDto: SearchVariantsDto) {
    return this.productVariantService.searchVariants(searchDto.product_id || 0, searchDto.attributes);
  }

  @Get('sku/:sku')
  @Permission('product_variant.manage')
  async getBySku(
    @Param('sku') sku: string,
    @Query('include_attributes') includeAttributes?: string,
  ) {
    return this.productVariantService.getBySku(sku, { include_attributes: includeAttributes === 'true' });
  }

  @Get(':id')
  @Permission('product_variant.manage')
  async getOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('include_attributes') includeAttributes?: string,
  ) {
    return this.productVariantService.getOne(id, { include_attributes: includeAttributes === 'true' });
  }

  @LogRequest()
  @Post()
  @Permission('product_variant.manage')
  async create(@Body(ValidationPipe) dto: CreateProductVariantDto) {
    return this.productVariantService.create(dto as any);
  }

  @LogRequest()
  @Put(':id')
  @Permission('product_variant.manage')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateProductVariantDto,
  ) {
    return this.productVariantService.update(id, dto as any);
  }

  @LogRequest()
  @Put(':id/restore')
  @Permission('product_variant.manage')
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.productVariantService.restore(id);
  }

  @LogRequest()
  @Delete(':id')
  @Permission('product_variant.manage')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productVariantService.softDelete(id);
  }
}