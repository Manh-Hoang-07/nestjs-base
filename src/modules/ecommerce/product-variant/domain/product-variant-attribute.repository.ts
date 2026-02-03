import { ProductVariantAttribute } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const PRODUCT_VARIANT_ATTRIBUTE_REPOSITORY = 'IProductVariantAttributeRepository';

export interface ProductVariantAttributeFilter {
    productVariantId?: number | bigint;
}

export interface IProductVariantAttributeRepository extends IRepository<ProductVariantAttribute> {
    createMany(data: any[]): Promise<void>;
}
