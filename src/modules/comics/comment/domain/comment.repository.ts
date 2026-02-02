import { Comment } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const COMMENT_REPOSITORY = 'ICommentRepository';

export interface CommentFilter {
    user_id?: number | bigint;
    comic_id?: number | bigint;
    chapter_id?: number | bigint;
    parent_id?: number | bigint;
    status?: string;
}

export interface ICommentRepository extends IRepository<Comment> {
}
