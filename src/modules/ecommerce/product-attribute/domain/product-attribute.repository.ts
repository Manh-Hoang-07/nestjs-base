import { ProductAttribute } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const PRODUCT_ATTRIBUTE_REPOSITORY = 'IProductAttributeRepository';

export interface ProductAttributeFilter {
    search?: string;
    code?: string;
    deleted_at?: Date | null;
}

export interface IProductAttributeRepository extends IRepository<ProductAttribute> {
    findByCode(code: string): Promise<ProductAttribute | null>;
}


