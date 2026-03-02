import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ProductAttribute } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IProductAttributeRepository, PRODUCT_ATTRIBUTE_REPOSITORY } from '../../domain/product-attribute.repository';
import { CreateProductAttributeDto } from '../dtos/create-product-attribute.dto';
import { UpdateProductAttributeDto } from '../dtos/update-product-attribute.dto';
import { slugify } from '@/common/shared/utils/string.util';
import { verifyGroupOwnership } from '@/common/shared/utils/group-ownership.util';

@Injectable()
export class AdminProductAttributeService extends BaseService<ProductAttribute, IProductAttributeRepository> {
  constructor(
    @Inject(PRODUCT_ATTRIBUTE_REPOSITORY)
    protected readonly productAttributeRepository: IProductAttributeRepository,
  ) {
    super(productAttributeRepository);
    this.autoAddGroupId = true;
  }

  async getSimpleList(query: any) {
    return this.getList({ ...query, limit: 1000 });
  }

  protected override async prepareFilters(filters?: any): Promise<any> {
    const prepared = { ...(filters || {}) };
    if (prepared.group_id === undefined) {
      Object.assign(prepared, this.getGroupFilter());
    }
    return prepared;
  }

  protected override async beforeCreate(data: CreateProductAttributeDto): Promise<any> {
    const payload = await super.beforeCreate(data);

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
    const entity = await this.productAttributeRepository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Product Attribute with ID ${id} not found`);
    }

    verifyGroupOwnership(entity as any);

    const payload = { ...data };
    if (payload.code && payload.code !== entity.code) {
      const existing = await this.productAttributeRepository.findByCode(payload.code);
      if (existing && existing.id !== entity.id) {
        payload.code = `${payload.code}_${Date.now()}`;
      }
    }

    return payload;
  }

  override async getOne(id: string | number | bigint): Promise<ProductAttribute> {
    const entity = await super.getOne(id);
    verifyGroupOwnership(entity as any);
    return entity;
  }

  protected override async beforeDelete(id: string | number | bigint): Promise<boolean> {
    const entity = await this.repository.findById(id);
    if (entity) verifyGroupOwnership(entity as any);
    return true;
  }
}

