import { ProductReview } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const PRODUCT_REVIEW_REPOSITORY = 'IProductReviewRepository';

export interface ProductReviewFilter {
    productId?: number | bigint;
    userId?: number | bigint;
    status?: 'active' | 'inactive';
    rating?: number;
    deleted_at?: Date | null;
}

export interface IProductReviewRepository extends IRepository<ProductReview> {
    findByProductId(productId: number | bigint): Promise<ProductReview[]>;
}
