
import { PostCategory } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const POST_CATEGORY_REPOSITORY = 'IPostCategoryRepository';

export interface PostCategoryFilter {
    search?: string;
    status?: string | number;
    parentId?: number | bigint;
}

export interface IPostCategoryRepository extends IRepository<PostCategory> {
    findBySlug(slug: string): Promise<PostCategory | null>;
    findAllWithChildren(): Promise<any[]>;
}
