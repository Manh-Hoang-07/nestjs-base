import { Product } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const PRODUCT_REPOSITORY = 'IProductRepository';

export interface ProductFilter {
    status?: 'active' | 'inactive' | 'draft' | 'archived';
    search?: string;
    categorySlug?: string;
    categoryId?: number | bigint;
    isFeatured?: boolean;
    isVariable?: boolean;
    isDigital?: boolean;
    groupId?: number | bigint;
    deleted_at?: Date | null;
}

export interface IProductRepository extends IRepository<Product> {
    findBySlug(slug: string): Promise<Product | null>;
    findBySku(sku: string): Promise<Product | null>;

    // Admin specific methods
    syncCategories(productId: number | bigint, categoryIds: (number | bigint)[]): Promise<void>;
    findVariants(productId: number | bigint): Promise<any[]>;
}
