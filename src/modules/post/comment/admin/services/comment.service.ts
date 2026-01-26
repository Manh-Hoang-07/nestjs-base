import { Injectable, Inject } from '@nestjs/common';
import { PostComment } from '@prisma/client';
import { IPostCommentRepository, POST_COMMENT_REPOSITORY, PostCommentFilter } from '@/modules/post/comment/domain/post-comment.repository';
import { BaseContentService } from '@/common/core/services';

@Injectable()
export class AdminPostCommentService extends BaseContentService<PostComment, IPostCommentRepository> {
    constructor(
        @Inject(POST_COMMENT_REPOSITORY)
        private readonly commentRepo: IPostCommentRepository,
    ) {
        super(commentRepo);
    }

    async getList(query: any) {
        const filter: PostCommentFilter = {};
        if (query.post_id) filter.postId = query.post_id;
        if (query.status) filter.status = query.status;
        if (query.search) filter.search = query.search;

        return super.getList({
            page: query.page,
            limit: query.limit,
            sort: query.sort,
            filter,
        });
    }

    async updateCommentStatus(id: number, status: string) {
        return this.changeStatus(id, status);
    }

    async deleteComment(id: number) {
        return this.delete(id);
    }
}
