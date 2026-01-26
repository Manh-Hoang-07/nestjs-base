import { Post } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const POST_REPOSITORY = 'IPostRepository';

export interface PostFilter {
    status?: 'published' | 'draft' | 'scheduled' | 'hidden';
    search?: string;
    categorySlug?: string;
    tagSlug?: string;
    categoryId?: number;
    tagId?: number;
    isFeatured?: boolean;
    isPinned?: boolean;
    deleted_at?: Date | null;
}

export interface IPostRepository extends IRepository<Post> {
    incrementViewCount(id: number | bigint): Promise<void>;
    findPublishedBySlug(slug: string): Promise<Post | null>;

    // Admin specific methods
    syncRelations(postId: number | bigint, tagIds?: number[], categoryIds?: number[]): Promise<void>;
    getViewStats(postId: number | bigint, startDate: Date, endDate: Date): Promise<any[]>; // Should define specific DTO/Entity for stats if needed
    getStatisticsOverview(): Promise<any>; // Define return type

    // Batch operations for cron jobs
    batchIncrementViewCount(postId: number | bigint, count: number): Promise<void>;
    upsertViewStats(postId: number | bigint, viewDate: Date, count: number): Promise<void>;
}

