import { ComicReview } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const REVIEW_REPOSITORY = 'IReviewRepository';

export interface ReviewFilter {
    user_id?: number | bigint;
    comic_id?: number | bigint;
    rating?: number;
    group_id?: number | bigint;
}

export interface IReviewRepository extends IRepository<ComicReview> {
    syncRatingStats(comicId: number | bigint): Promise<void>;
    getAverageRating(filter?: Record<string, any>): Promise<number>;
    getRatingDistribution(filter?: Record<string, any>): Promise<any[]>;
}


