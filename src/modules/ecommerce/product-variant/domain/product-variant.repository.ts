import { ProductVariant } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const PRODUCT_VARIANT_REPOSITORY = 'IProductVariantRepository';

export interface ProductVariantFilter {
    productId?: number | bigint;
    sku?: string;
    search?: string;
    isActive?: boolean;
    deleted_at?: Date | null;
}

export interface IProductVariantRepository extends IRepository<ProductVariant> {
    findBySku(sku: string): Promise<ProductVariant | null>;
}


