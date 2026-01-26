
import { Injectable } from '@nestjs/common';
import { PostComment, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IPostCommentRepository, PostCommentFilter } from '../../domain/post-comment.repository';

@Injectable()
export class PostCommentRepositoryImpl extends PrismaRepository<
    PostComment,
    Prisma.PostCommentWhereInput,
    Prisma.PostCommentCreateInput,
    Prisma.PostCommentUpdateInput,
    Prisma.PostCommentOrderByWithRelationInput
> implements IPostCommentRepository {

    constructor(private readonly prisma: PrismaService) {
        super(prisma.postComment as unknown as any);
        this.defaultSelect = {
            id: true,
            post_id: true,
            user_id: true,
            guest_name: true,
            guest_email: true,
            parent_id: true,
            content: true,
            status: true,
            created_at: true,
            post: { select: { id: true, name: true, slug: true } },
            user: { select: { id: true, name: true, email: true } },
        };
    }

    protected buildWhere(filter: PostCommentFilter): Prisma.PostCommentWhereInput {
        const where: Prisma.PostCommentWhereInput = {};

        if (filter.postId) where.post_id = this.toPrimaryKey(filter.postId);
        if (filter.userId) where.user_id = this.toPrimaryKey(filter.userId);
        if (filter.status) where.status = filter.status as any;
        if (filter.parentId !== undefined) {
            where.parent_id = filter.parentId === null ? null : this.toPrimaryKey(filter.parentId);
        }
        if (filter.search) {
            where.content = { contains: filter.search };
        }

        return where;
    }

    async findWithReplies(postId: number | bigint): Promise<PostComment[]> {
        return this.findManyRaw({
            where: {
                post_id: this.toPrimaryKey(postId),
                parent_id: null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                replies: {
                    where: { deleted_at: null },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        }) as unknown as PostComment[];
    }

    async updateStatus(id: number | bigint, status: string): Promise<PostComment> {
        return this.update(id, { status: status as any });
    }
}
