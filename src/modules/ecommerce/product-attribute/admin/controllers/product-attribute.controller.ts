import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/auth/guards/jwt-auth.guard';
import { RbacGuard } from '@/common/auth/guards/rbac.guard';
import { Permission } from '@/common/auth/decorators/rbac.decorators';
import { AdminProductAttributeService } from '../services/product-attribute.service';
import { CreateProductAttributeDto } from '../dtos/create-product-attribute.dto';
import { UpdateProductAttributeDto } from '../dtos/update-product-attribute.dto';
import { LogRequest } from '@/common/shared/decorators/log-request.decorator';

@Controller('admin/product-attributes')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminProductAttributeController {
  constructor(private readonly productAttributeService: AdminProductAttributeService) { }

  @Get()
  @Permission('product_attribute.manage')
  async getList(@Query() query: any) {
    return this.productAttributeService.getList(query);
  }

  @Get('simple')
  @Permission('product_attribute.manage')
  async getSimpleList(@Query() query: any) {
    return this.productAttributeService.getSimpleList(query);
  }

  @Get(':id')
  @Permission('product_attribute.manage')
  async getOne(@Param('id') id: string) {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}. ID must be a number.`);
    }
    return this.productAttributeService.getOne(id);
  }

  @LogRequest()
  @Post()
  @Permission('product_attribute.manage')
  async create(@Body(ValidationPipe) dto: CreateProductAttributeDto) {
    return this.productAttributeService.create(dto);
  }

  @LogRequest()
  @Put(':id')
  @Permission('product_attribute.manage')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateProductAttributeDto,
  ) {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}. ID must be a number.`);
    }
    return this.productAttributeService.update(id, dto);
  }

  @LogRequest()
  @Delete(':id')
  @Permission('product_attribute.manage')
  async delete(@Param('id') id: string) {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}. ID must be a number.`);
    }
    return this.productAttributeService.delete(id);
  }
}