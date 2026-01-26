import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { CrudService } from '@/common/base/services/crud.service';

@Injectable()
export class AdminProductVariantService extends CrudService<ProductVariant> {
  constructor(
    @InjectRepository(ProductVariant)
    protected readonly productVariantRepository: Repository<ProductVariant>,
  ) {
    super(productVariantRepository);
  }

  /**
   * Override prepareOptions để load relations mặc định
   */
  protected prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: ['product'],
    } as any;
  }

  /**
   * Search variants by product ID and optional attribute filters
   */
  async searchVariants(
    productId: number,
    attributeFilters?: { attribute_id: number; value_id: number }[]
  ): Promise<ProductVariant[]> {
    const query = this.productVariantRepository
      .createQueryBuilder('variant')
      .where('variant.product_id = :productId', { productId })
      .andWhere('variant.status = :status', { status: 'active' });

    if (attributeFilters && attributeFilters.length > 0) {
      attributeFilters.forEach((filter, index) => {
        const alias = `pva${index}`;
        query.innerJoin(
          'product_variant_attributes',
          alias,
          `${alias}.product_variant_id = variant.id AND ${alias}.product_attribute_id = :attrId${index} AND ${alias}.product_attribute_value_id = :valueId${index}`
        );
        query.setParameter(`attrId${index}`, filter.attribute_id);
        query.setParameter(`valueId${index}`, filter.value_id);
      });
    }

    return query.getMany();
  }
}