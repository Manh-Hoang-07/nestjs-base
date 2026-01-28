import { Injectable, Inject } from '@nestjs/common';
import { ProductAttributeValue } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IProductAttributeValueRepository, PRODUCT_ATTRIBUTE_VALUE_REPOSITORY } from '../../domain/product-attribute-value.repository';
import { CreateProductAttributeValueDto } from '../dtos/create-product-attribute-value.dto';
import { UpdateProductAttributeValueDto } from '../dtos/update-product-attribute-value.dto';

@Injectable()
export class AdminProductAttributeValueService extends BaseService<ProductAttributeValue, IProductAttributeValueRepository> {
  constructor(
    @Inject(PRODUCT_ATTRIBUTE_VALUE_REPOSITORY)
    protected readonly productAttributeValueRepository: IProductAttributeValueRepository,
  ) {
    super(productAttributeValueRepository);
  }

  async getSimpleList(query: any) {
    return this.getList({ ...query, limit: 1000 });
  }

  async restore(id: number | bigint) {
    // Placeholder - repository should support restore if soft delete is used
    return this.productAttributeValueRepository.update(id, { deleted_at: null } as any);
  }

  protected override async beforeCreate(data: CreateProductAttributeValueDto): Promise<any> {
    const payload: any = { ...data };
    if (payload.attribute_id) {
      payload.product_attribute_id = BigInt(payload.attribute_id);
      delete payload.attribute_id;
    }
    // Remove product_variant_id as it's not a field of ProductAttributeValue
    // product_variant_id belongs to ProductVariantAttribute (junction table)
    if (payload.product_variant_id !== undefined) {
      delete payload.product_variant_id;
    }
    // If label is not provided, use value as label
    if (!payload.label && payload.value) {
      payload.label = payload.value;
    }
    return payload;
  }

  protected override async beforeUpdate(id: string | number | bigint, data: UpdateProductAttributeValueDto): Promise<any> {
    const payload: any = { ...data };
    if (payload.attribute_id) {
      payload.product_attribute_id = BigInt(payload.attribute_id);
      delete payload.attribute_id;
    }
    // Remove product_variant_id as it's not a field of ProductAttributeValue
    // product_variant_id belongs to ProductVariantAttribute (junction table)
    if (payload.product_variant_id !== undefined) {
      delete payload.product_variant_id;
    }
    return payload;
  }

  async findByAttributeId(attributeId: number | bigint): Promise<ProductAttributeValue[]> {
    return this.productAttributeValueRepository.findByAttributeId(attributeId);
  }
}