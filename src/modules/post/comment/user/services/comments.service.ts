import { Injectable, Inject, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PostComment } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IPostCommentRepository, POST_COMMENT_REPOSITORY } from '../../domain/post-comment.repository';
import { RequestContext } from '@/common/shared/utils';
import { PostNotificationService } from '@/modules/post/shared/services/post-notification.service';

@Injectable()
export class UserPostCommentsService extends BaseService<PostComment, IPostCommentRepository> {
    constructor(
        @Inject(POST_COMMENT_REPOSITORY)
        protected readonly commentRepository: IPostCommentRepository,
        private readonly notificationService: PostNotificationService,
    ) {
        super(commentRepository);
    }

    protected override async prepareFilters(filters?: any) {
        const userId = RequestContext.get<number>('userId');
        const prepared: any = { ...(filters || {}) };

        // Nếu gọi getByUser thì lọc theo user
        if (prepared.by_current_user) {
            prepared.userId = userId;
            delete prepared.by_current_user;
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
                        username: true,
                        name: true,
                        image: true
                    }
                },
                post: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                image: true
                            }
                        }
                    },
                    take: 5
                }
            },
            sort: options?.sort ?? 'created_at:desc',
        };
    }

    protected override async beforeCreate(data: any): Promise<any> {
        const userId = RequestContext.get<number>('userId');
        if (!userId) throw new UnauthorizedException();

        const payload = { ...data };
        payload.user_id = userId;
        payload.status = 'visible';

        // Validate parent
        if (payload.parent_id) {
            const parent = await this.repository.findById(payload.parent_id);
            if (!parent) throw new NotFoundException('Parent comment not found');
            if (Number(parent.post_id) !== Number(payload.post_id)) {
                throw new BadRequestException('Parent comment must be from the same post');
            }
        }

        return payload;
    }

    protected override async afterCreate(entity: PostComment, data: any): Promise<void> {
        if (entity.parent_id) {
            await this.notificationService.notifyCommentReply(
                Number(entity.id),
                Number(entity.parent_id),
                Number(entity.user_id)
            );
        }
    }

    async updateComment(id: number | bigint, content: string) {
        const userId = RequestContext.get<number>('userId');
        if (!userId) throw new UnauthorizedException();

        const comment = await this.repository.findOne({
            id,
            userId
        });

        if (!comment) throw new NotFoundException('Comment not found');

        return this.update(id, { content });
    }

    async removeComment(id: number | bigint) {
        const userId = RequestContext.get<number>('userId');
        if (!userId) throw new UnauthorizedException();

        const comment = await this.repository.findOne({
            id,
            userId
        });

        if (!comment) throw new NotFoundException('Comment not found');

        return this.repository.delete(id);
    }

    protected override transform(entity: any): any {
        return this.deepConvertBigInt(entity);
    }
}
