
import { Injectable } from '@nestjs/common';
import { Post, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IPostRepository, PostFilter } from '../../domain/post.repository';
import { RedisUtil } from '@/core/utils/redis.util';

@Injectable()
export class PostRepositoryImpl extends PrismaRepository<
    Post,
    Prisma.PostWhereInput,
    Prisma.PostCreateInput,
    Prisma.PostUpdateInput,
    Prisma.PostOrderByWithRelationInput
> implements IPostRepository {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisUtil,
    ) {
        super(prisma.post as unknown as any);
        this.defaultSelect = {
            id: true,
            name: true,
            slug: true,
            excerpt: true,
            content: true,
            image: true,
            cover_image: true,
            primary_postcategory_id: true,
            status: true,
            post_type: true,
            video_url: true,
            audio_url: true,
            is_featured: true,
            is_pinned: true,
            published_at: true,
            view_count: true,
            meta_title: true,
            meta_description: true,
            canonical_url: true,
            og_title: true,
            og_description: true,
            og_image: true,
            group_id: true,
            created_at: true,
            updated_at: true,
            primary_category: { select: { id: true, name: true, slug: true, status: true } },
            categories: {
                select: {
                    category: { select: { id: true, name: true, slug: true } },
                },
            },
            tags: {
                select: {
                    tag: { select: { id: true, name: true, slug: true } },
                },
            },
        };
    }

    protected buildWhere(filter: PostFilter): Prisma.PostWhereInput {
        const where: Prisma.PostWhereInput = {};

        if (filter.status) where.status = filter.status as any;

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { slug: { contains: filter.search } },
            ];
        }

        if (filter.categorySlug) {
            where.categories = {
                some: {
                    category: { slug: filter.categorySlug },
                },
            };
        }

        if (filter.tagSlug) {
            where.tags = {
                some: {
                    tag: { slug: filter.tagSlug },
                },
            };
        }

        if (filter.categoryId) {
            where.categories = {
                some: {
                    category: { id: this.toPrimaryKey(filter.categoryId) },
                },
            };
        }

        if (filter.tagId) {
            where.tags = {
                some: {
                    tag: { id: this.toPrimaryKey(filter.tagId) },
                },
            };
        }

        if (filter.isFeatured !== undefined) where.is_featured = filter.isFeatured;
        if (filter.isPinned !== undefined) where.is_pinned = filter.isPinned;

        return where;
    }

    async findPublishedBySlug(slug: string): Promise<Post | null> {
        return this.findOne({
            slug,
            status: 'published',
        });
    }

    async incrementViewCount(id: number | bigint): Promise<void> {
        try {
            if (this.redis.isEnabled()) {
                await this.redis.hincrby('post:views:buffer', id.toString(), 1);
            } else {
                await this.update(id, { view_count: { increment: 1 } });
            }
        } catch (e) {
            console.error('Failed to increment view count', e);
        }
    }

    async syncRelations(postId: number | bigint, tagIds?: number[], categoryIds?: number[]): Promise<void> {
        const id = this.toPrimaryKey(postId);

        if (tagIds !== undefined && tagIds !== null) {
            await this.prisma.postPosttag.deleteMany({ where: { post_id: id } });
            if (tagIds.length > 0) {
                await this.prisma.postPosttag.createMany({
                    data: tagIds.map((tagId) => ({ post_id: id, posttag_id: this.toPrimaryKey(tagId) })),
                    skipDuplicates: true,
                });
            }
        }

        if (categoryIds !== undefined && categoryIds !== null) {
            await this.prisma.postPostcategory.deleteMany({ where: { post_id: id } });
            if (categoryIds.length > 0) {
                await this.prisma.postPostcategory.createMany({
                    data: categoryIds.map((catId) => ({ post_id: id, postcategory_id: this.toPrimaryKey(catId) })),
                    skipDuplicates: true,
                });
            }
        }
    }

    async getViewStats(postId: number | bigint, startDate: Date, endDate: Date): Promise<any[]> {
        return (this.prisma as any).postViewStats.findMany({
            where: {
                post_id: this.toPrimaryKey(postId),
                view_date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { view_date: 'asc' },
        });
    }

    async getStatisticsOverview(): Promise<any> {
        const totalPosts = await this.count({});
        const publishedPosts = await this.count({ status: 'published' });
        const draftPosts = await this.count({ status: 'draft' });
        const scheduledPosts = await this.count({ status: 'scheduled' });

        const topViewedPosts = await this.findMany({
            status: 'published'
        }, {
            limit: 10,
            sort: 'view_count:desc'
        });

        const totalComments = await (this.prisma as any).postComment.count({
            where: { deleted_at: null },
        });

        const pendingComments = await (this.prisma as any).postComment.count({
            where: { status: 'hidden', deleted_at: null },
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentViews = await (this.prisma as any).postViewStats.aggregate({
            where: {
                view_date: { gte: thirtyDaysAgo },
            },
            _sum: { view_count: true },
        });

        return {
            total_posts: totalPosts,
            published_posts: publishedPosts,
            draft_posts: draftPosts,
            scheduled_posts: scheduledPosts,
            total_comments: totalComments,
            pending_comments: pendingComments,
            total_views_last_30_days: recentViews._sum.view_count || 0,
            top_viewed_posts: topViewedPosts,
        };
    }

    async batchIncrementViewCount(postId: number | bigint, count: number): Promise<void> {
        await this.update(postId, { view_count: { increment: count } });
    }

    async upsertViewStats(postId: number | bigint, viewDate: Date, count: number): Promise<void> {
        const pk = this.toPrimaryKey(postId);
        await (this.prisma as any).postViewStats.upsert({
            where: {
                post_id_view_date: {
                    post_id: pk,
                    view_date: viewDate,
                },
            },
            create: {
                post_id: pk,
                view_date: viewDate,
                view_count: count,
            },
            update: {
                view_count: { increment: count },
            },
        });
    }
}
