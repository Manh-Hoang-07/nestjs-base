import { Injectable } from '@nestjs/common';
import { ProductReview, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IReviewRepository } from '../../domain/review.repository';

@Injectable()
export class ReviewRepositoryImpl
    extends PrismaRepository<ProductReview>
    implements IReviewRepository {
    constructor(private readonly prismaService: PrismaService) {
        super(prismaService.productReview as any);
    }

    async findByProduct(productId: number | bigint): Promise<ProductReview[]> {
        return this.prismaService.productReview.findMany({
            where: {
                product_id: BigInt(productId),
                deleted_at: null,
            },
        });
    }

    async getStats(productId: number | bigint): Promise<any> {
        const stats = await this.prismaService.productReview.aggregate({
            where: {
                product_id: BigInt(productId),
                deleted_at: null,
                status: 'active',
            },
            _avg: {
                rating: true,
            },
            _count: {
                id: true,
            },
        });

        const counts = await this.prismaService.productReview.groupBy({
            by: ['rating'],
            where: {
                product_id: BigInt(productId),
                deleted_at: null,
                status: 'active',
            },
            _count: {
                id: true,
            },
        });

        return {
            averageRating: stats._avg.rating || 0,
            totalCount: stats._count.id || 0,
            ratingDistribution: counts.reduce((acc: Record<number, number>, curr: any) => {
                acc[curr.rating] = curr._count.id;
                return acc;
            }, {} as Record<number, number>),
        };
    }

    async incrementHelpfulCount(reviewId: number | bigint): Promise<void> {
        await this.prismaService.productReview.update({
            where: { id: BigInt(reviewId) },
            data: {
                helpful_count: { increment: 1 }
            }
        });
    }

    protected override buildWhere(filter: any): Prisma.ProductReviewWhereInput {
        const where: Prisma.ProductReviewWhereInput = {
            deleted_at: null,
        };

        if (filter.product_id) where.product_id = BigInt(filter.product_id);
        if (filter.user_id) where.user_id = BigInt(filter.user_id);
        if (filter.rating) where.rating = Number(filter.rating);
        if (filter.status) where.status = filter.status;

        return where;
    }
}


