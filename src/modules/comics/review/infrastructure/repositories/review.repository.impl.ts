import { Injectable } from '@nestjs/common';
import { ComicReview, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IReviewRepository, ReviewFilter } from '../../domain/review.repository';

@Injectable()
export class ReviewRepositoryImpl extends PrismaRepository<
    ComicReview,
    Prisma.ComicReviewWhereInput,
    Prisma.ComicReviewCreateInput,
    Prisma.ComicReviewUpdateInput,
    Prisma.ComicReviewOrderByWithRelationInput
> implements IReviewRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.comicReview as any, 'updated_at:desc');
        this.isSoftDelete = false;
    }

    protected buildWhere(filter: ReviewFilter & { date_from?: Date; date_to?: Date; search?: string }): Prisma.ComicReviewWhereInput {
        const where: Prisma.ComicReviewWhereInput = {};

        if (filter.group_id !== undefined) {
            (where as any).comic = {
                group_id: filter.group_id === null ? null : this.toPrimaryKey(filter.group_id),
            };
        }

        if (filter.user_id) where.user_id = this.toPrimaryKey(filter.user_id);
        if (filter.comic_id) where.comic_id = this.toPrimaryKey(filter.comic_id);
        if (filter.rating) where.rating = filter.rating;

        if (filter.search) {
            where.content = { contains: filter.search };
        }

        if (filter.date_from || filter.date_to) {
            where.created_at = {};
            if (filter.date_from) where.created_at.gte = filter.date_from;
            if (filter.date_to) where.created_at.lte = filter.date_to;
        }

        return where;
    }

    async syncRatingStats(comicId: number | bigint): Promise<void> {
        const id = this.toPrimaryKey(comicId);

        // Calculate aggregate
        const aggregate = await this.prisma.comicReview.aggregate({
            where: { comic_id: id },
            _count: { rating: true },
            _sum: { rating: true },
        });

        const count = aggregate._count.rating || 0;
        const sum = aggregate._sum.rating || 0;

        await this.prisma.comicStats.upsert({
            where: { comic_id: id },
            create: {
                comic_id: id,
                view_count: 0,
                follow_count: 0,
                rating_count: BigInt(count),
                rating_sum: BigInt(sum),
            },
            update: {
                rating_count: BigInt(count),
                rating_sum: BigInt(sum),
            },
        });
    }

    async getAverageRating(filter: Record<string, any> = {}): Promise<number> {
        const where = this.buildWhere(filter);
        const result = await this.prisma.comicReview.aggregate({
            where,
            _avg: { rating: true },
        });
        return result._avg.rating || 0;
    }

    async getRatingDistribution(filter: Record<string, any> = {}): Promise<any[]> {
        const where = this.buildWhere(filter);
        const result = await this.prisma.comicReview.groupBy({
            by: ['rating'],
            where,
            _count: { rating: true },
            orderBy: { rating: 'asc' },
        });
        return result.map(r => ({
            rating: r.rating,
            count: r._count.rating,
        }));
    }
}


