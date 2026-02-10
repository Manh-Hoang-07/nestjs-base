import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PostComment } from '@prisma/client';
import { IPostCommentRepository, POST_COMMENT_REPOSITORY, PostCommentFilter } from '@/modules/post/comment/domain/post-comment.repository';
import { BaseContentService } from '@/common/core/services';
import { IPaginationOptions } from '@/common/core/repositories';

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

        // Logic similar to Comic default parent_id=null
        if (query.parent_id !== undefined) {
            if (query.parent_id === 'null' || query.parent_id === null) {
                filter.parentId = null;
            } else {
                filter.parentId = query.parent_id;
            }
        } else {
            filter.parentId = null;
        }

        return super.getList({
            page: query.page,
            limit: query.limit,
            sort: query.sort,
            filter,
        });
    }

    protected override async prepareOptions(options: any = {}) {
        const base = await super.prepareOptions(options);
        return {
            ...base,
            include: options?.include ?? {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                },
                post: {
                    select: { id: true, name: true, slug: true }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            }
                        },
                        replies: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        image: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
    }

    override async getOne(id: string | number | bigint, options: IPaginationOptions = {}): Promise<PostComment> {
        const include = {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                }
            },
            post: {
                select: { id: true, name: true, slug: true }
            },
            replies: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        }
                    },
                    replies: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    image: true,
                                }
                            }
                        }
                    }
                }
            }
        };

        const entity = await (this.repository as any).delegate.findFirst({
            where: { id: (this.repository as any).toPrimaryKey(id) },
            include
        });

        if (!entity) {
            throw new NotFoundException(`Comment with ID ${id} not found`);
        }

        return this.transform(entity) as PostComment;
    }

    async getStatistics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [total, visible, hidden, todayCount, thisWeekCount, thisMonthCount] = await Promise.all([
            this.repository.count({}),
            this.repository.count({ status: 'visible' }),
            this.repository.count({ status: 'hidden' }),
            this.repository.count({
                startDate: today,
            }),
            this.repository.count({
                startDate: startOfWeek,
            }),
            this.repository.count({
                startDate: startOfMonth,
            }),
        ]);

        return {
            total,
            visible,
            hidden,
            today: todayCount,
            this_week: thisWeekCount,
            this_month: thisMonthCount,
        };
    }
}
