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

    // Override prepareFilters to handle filter logic standardly
    protected override async prepareFilters(filters: any = {}, _options?: any): Promise<any> {
        const prepared = { ...filters };

        // Map snake_case query params to camelCase filter properties expected by Repository
        if (prepared.post_id) {
            prepared.postId = prepared.post_id;
            delete prepared.post_id;
        }

        // Logic similar to Comic default parent_id=null
        if (prepared.parent_id !== undefined) {
            if (prepared.parent_id === 'null' || prepared.parent_id === null) {
                prepared.parentId = null;
            } else {
                prepared.parentId = prepared.parent_id;
            }
            delete prepared.parent_id;
        } else {
            // Default to root comments if parent_id is not specified
            // Check if parentId is already set (e.g. from internal call)
            if (prepared.parentId === undefined) {
                prepared.parentId = null;
            }
        }

        if (prepared.search) {
            // If repository expects 'search' in filter, keep it.
            // PostCommentRepositoryImpl checks filter.search.
        }

        // Map date filters if needed (Comic uses date_from, PostRepo uses startDate)
        if (prepared.date_from) {
            prepared.startDate = prepared.date_from;
            delete prepared.date_from;
        }
        if (prepared.date_to) {
            prepared.endDate = prepared.date_to;
            delete prepared.date_to;
        }

        return prepared;
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
