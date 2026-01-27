import { ProductCategory } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const PRODUCT_CATEGORY_REPOSITORY = 'IProductCategoryRepository';

export interface ProductCategoryFilter {
    status?: 'active' | 'inactive';
    search?: string;
    parent_id?: number | bigint;
    deleted_at?: Date | null;
}

export interface IProductCategoryRepository extends IRepository<ProductCategory> {
    findBySlug(slug: string): Promise<ProductCategory | null>;
    getTree(): Promise<ProductCategory[]>;
}
