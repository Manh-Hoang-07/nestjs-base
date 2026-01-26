
import { PostComment } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const POST_COMMENT_REPOSITORY = 'IPostCommentRepository';

export interface PostCommentFilter {
    postId?: number | bigint;
    userId?: number | bigint;
    status?: string;
    parentId?: number | bigint;
    search?: string;
}

export interface IPostCommentRepository extends IRepository<PostComment> {
    findWithReplies(postId: number | bigint): Promise<PostComment[]>;
    updateStatus(id: number | bigint, status: string): Promise<PostComment>;
}
