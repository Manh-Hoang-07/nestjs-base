import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { IPostCommentRepository, POST_COMMENT_REPOSITORY, PostCommentFilter } from '@/modules/post/comment/domain/post-comment.repository';
import { POST_REPOSITORY, IPostRepository } from '@/modules/post/post/domain/post.repository';

@Injectable()
export class PostCommentService {
    constructor(
        @Inject(POST_COMMENT_REPOSITORY)
        private readonly commentRepo: IPostCommentRepository,
        @Inject(POST_REPOSITORY)
        private readonly postRepo: IPostRepository,
    ) { }

    async createComment(data: {
        post_id: number | bigint;
        user_id?: number | bigint;
        guest_name?: string;
        guest_email?: string;
        content: string;
        parent_id?: number | bigint;
    }) {
        const post = await this.postRepo.findById(data.post_id);
        if (!post) throw new NotFoundException('Post not found');

        if (data.parent_id) {
            const parent = await this.commentRepo.findById(data.parent_id);
            if (!parent) throw new NotFoundException('Parent comment not found');
            if (parent.post_id !== BigInt(data.post_id)) {
                throw new ForbiddenException('Parent comment belongs to a different post');
            }
        }

        return this.commentRepo.create({
            post_id: BigInt(data.post_id),
            user_id: data.user_id ? BigInt(data.user_id) : null,
            guest_name: data.guest_name,
            guest_email: data.guest_email,
            content: data.content,
            parent_id: data.parent_id ? BigInt(data.parent_id) : null,
            status: 'visible' as any,
        });
    }

    async getCommentsByPost(postId: number | bigint, options: { page?: number, limit?: number } = {}) {
        // 1. Phân trang trên Root Comments
        const rootsResult = await this.commentRepo.findAll({
            page: options.page || 1,
            limit: options.limit || 10,
            sort: 'created_at:DESC',
            filter: {
                postId,
                parentId: null,
                status: 'visible'
            }
        });

        if (rootsResult.data.length === 0) return rootsResult;

        const rootIdsInPage = rootsResult.data.map(r => r.id);

        /**
         * 3. Lấy toàn bộ descendants (con, cháu...) của các rootIds này.
         * Để đơn giản và chính xác như logic cũ, ta lấy tất cả comments visible của post và dựng cây.
         */
        const allCommentsResult = await this.commentRepo.findAll({
            limit: 1000,
            filter: {
                postId,
                status: 'visible'
            },
            sort: 'created_at:ASC'
        });

        const allComments = allCommentsResult.data;

        // 4. Dựng cây và lọc
        const fullTree = this.buildCommentTree(allComments);
        const rootIdsSet = new Set(rootIdsInPage.map(id => id.toString()));
        const pagedTree = fullTree.filter(node => rootIdsSet.has(node.id.toString()));

        return {
            data: pagedTree,
            meta: rootsResult.meta
        };
    }

    private buildCommentTree(comments: any[]) {
        const map = new Map();
        const roots: any[] = [];

        comments.forEach(comment => {
            comment.replies = [];
            map.set(comment.id.toString(), comment);
        });

        comments.forEach(comment => {
            if (comment.parent_id) {
                const parent = map.get(comment.parent_id.toString());
                if (parent) {
                    parent.replies.push(comment);
                } else {
                    roots.push(comment);
                }
            } else {
                roots.push(comment);
            }
        });

        return roots;
    }
}
