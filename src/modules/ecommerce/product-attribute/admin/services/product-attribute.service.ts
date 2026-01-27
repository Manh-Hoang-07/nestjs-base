import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ProductAttribute } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IProductAttributeRepository, PRODUCT_ATTRIBUTE_REPOSITORY } from '../../domain/product-attribute.repository';
import { CreateProductAttributeDto } from '../dtos/create-product-attribute.dto';
import { UpdateProductAttributeDto } from '../dtos/update-product-attribute.dto';
import { slugify } from '@/common/shared/utils/string.util';

@Injectable()
export class AdminProductAttributeService extends BaseService<ProductAttribute, IProductAttributeRepository> {
  constructor(
    @Inject(PRODUCT_ATTRIBUTE_REPOSITORY)
    protected readonly productAttributeRepository: IProductAttributeRepository,
  ) {
    super(productAttributeRepository);
  }

  async getSimpleList(query: any) {
    return this.getList({ ...query, limit: 1000 });
  }

  protected override async beforeCreate(data: CreateProductAttributeDto): Promise<any> {
    const payload = { ...data };
    if (!payload.code) {
      payload.code = slugify(payload.name).replace(/-/g, '_');
    }

    const existing = await this.productAttributeRepository.findByCode(payload.code);
    if (existing) {
      payload.code = `${payload.code}_${Date.now()}`;
    }

    return payload;
  }

  protected override async beforeUpdate(id: string | number | bigint, data: UpdateProductAttributeDto): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Product Attribute with ID ${id} not found`);
    }

    const payload = { ...data };
    if (payload.code && payload.code !== entity.code) {
      const existing = await this.productAttributeRepository.findByCode(payload.code);
      if (existing && existing.id !== entity.id) {
        payload.code = `${payload.code}_${Date.now()}`;
      }
    }

    return payload;
  }
}