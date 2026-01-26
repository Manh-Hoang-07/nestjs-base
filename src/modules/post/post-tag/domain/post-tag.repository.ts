
import { PostTag } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const POST_TAG_REPOSITORY = 'IPostTagRepository';

export interface PostTagFilter {
    search?: string;
    status?: string | number;
}

export interface IPostTagRepository extends IRepository<PostTag> {
    findBySlug(slug: string): Promise<PostTag | null>;
}
