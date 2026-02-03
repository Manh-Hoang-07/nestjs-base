import { ProductReview } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const REVIEW_REPOSITORY = 'IReviewRepository';

export interface ReviewFilter {
    product_id?: number | bigint;
    user_id?: number | bigint;
    rating?: number;
    status?: 'active' | 'inactive';
}

export interface IReviewRepository extends IRepository<ProductReview> {
    findByProduct(productId: number | bigint): Promise<ProductReview[]>;
    getStats(productId: number | bigint): Promise<any>;
    incrementHelpfulCount(reviewId: number | bigint): Promise<void>;
}


