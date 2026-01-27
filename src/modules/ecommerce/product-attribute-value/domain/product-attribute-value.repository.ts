import { ProductAttributeValue } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const PRODUCT_ATTRIBUTE_VALUE_REPOSITORY = 'IProductAttributeValueRepository';

export interface ProductAttributeValueFilter {
    attributeId?: number | bigint;
    search?: string;
    deleted_at?: Date | null;
}

export interface IProductAttributeValueRepository extends IRepository<ProductAttributeValue> {
    findByAttributeId(attributeId: number | bigint): Promise<ProductAttributeValue[]>;
}
