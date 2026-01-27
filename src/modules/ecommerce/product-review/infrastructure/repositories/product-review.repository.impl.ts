import { Injectable } from '@nestjs/common';
import { ProductReview, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IProductReviewRepository, ProductReviewFilter } from '../../domain/product-review.repository';

@Injectable()
export class ProductReviewRepositoryImpl extends PrismaRepository<
    ProductReview,
    Prisma.ProductReviewWhereInput,
    Prisma.ProductReviewCreateInput,
    Prisma.ProductReviewUpdateInput,
    Prisma.ProductReviewOrderByWithRelationInput
> implements IProductReviewRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.productReview as any);
        this.defaultSelect = {
            id: true,
            product_id: true,
            user_id: true,
            customer_name: true,
            customer_email: true,
            rating: true,
            comment: true,
            status: true,
            created_at: true,
            updated_at: true,
            product: { select: { name: true } }
        };
    }

    protected buildWhere(filter: ProductReviewFilter): Prisma.ProductReviewWhereInput {
        const where: Prisma.ProductReviewWhereInput = {};

        if (filter.productId) where.product_id = this.toPrimaryKey(filter.productId);
        if (filter.userId) where.user_id = this.toPrimaryKey(filter.userId);
        if (filter.status) where.status = filter.status as any;
        if (filter.rating) where.rating = filter.rating;

        return where;
    }

    async findByProductId(productId: number | bigint): Promise<ProductReview[]> {
        return this.findMany({ productId });
    }
}
