import { Injectable } from '@nestjs/common';
import { ProductCategory, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IProductCategoryRepository, ProductCategoryFilter } from '../../domain/product-category.repository';

@Injectable()
export class ProductCategoryRepositoryImpl extends PrismaRepository<
    ProductCategory,
    Prisma.ProductCategoryWhereInput,
    Prisma.ProductCategoryCreateInput,
    Prisma.ProductCategoryUpdateInput,
    Prisma.ProductCategoryOrderByWithRelationInput
> implements IProductCategoryRepository {
    constructor(
        private readonly prisma: PrismaService,
    ) {
        super(prisma.productCategory as any);
        this.defaultSelect = {
            id: true,
            name: true,
            slug: true,
            description: true,
            parent_id: true,
            image: true,
            icon: true,
            status: true,
            sort_order: true,
            meta_title: true,
            meta_description: true,
            canonical_url: true,
            og_image: true,
            created_at: true,
            updated_at: true,
        };
    }

    protected buildWhere(filter: ProductCategoryFilter): Prisma.ProductCategoryWhereInput {
        const where: any = {};

        if (filter.slug) where.slug = filter.slug;
        if (filter.status) where.status = filter.status as any;
        if (filter.parent_id !== undefined) {
            where.parent_id = filter.parent_id === null ? null : this.toPrimaryKey(filter.parent_id);
        }

        // ✅ Phân quyền Multi-shop: (Shared OR Specific Shop)
        if (filter.group_id !== undefined) {
            if (filter.group_id === null) {
                where.group_id = null;
            } else {
                where.OR = [
                    { group_id: null },
                    { group_id: this.toPrimaryKey(filter.group_id) }
                ];
            }
        }

        if (filter.search) {
            const searchCondition = {
                OR: [
                    { name: { contains: filter.search } },
                    { slug: { contains: filter.search } },
                ]
            };

            if (where.OR) {
                // Nếu đã có OR (từ group_id), ta bọc cả hai vào AND để tránh ghi đè
                const existingOr = where.OR;
                delete where.OR;
                where.AND = [
                    { OR: existingOr },
                    searchCondition
                ];
            } else {
                where.OR = searchCondition.OR;
            }
        }

        return where as Prisma.ProductCategoryWhereInput;
    }

    async findBySlug(slug: string): Promise<ProductCategory | null> {
        return this.findOne({ slug });
    }

    // [H1] Chỉ select các fields cần thiết thay vì fetch toàn bộ columns → giảm payload
    private readonly treeSelect = {
        id: true,
        name: true,
        slug: true,
        image: true,
        icon: true,
        sort_order: true,
        status: true,
        parent_id: true,
    };

    async getTree(groupId?: number | bigint | null): Promise<ProductCategory[]> {
        const where: any = { parent_id: null, deleted_at: null };

        if (groupId) {
            where.OR = [
                { group_id: null },
                { group_id: this.toPrimaryKey(groupId) }
            ];
        }

        return this.prisma.productCategory.findMany({
            where: where as any,
            select: {
                ...this.treeSelect,
                children: {
                    where: { deleted_at: null },
                    select: {
                        ...this.treeSelect,
                        children: {
                            where: { deleted_at: null },
                            select: this.treeSelect,
                            orderBy: { sort_order: 'asc' },
                        },
                    },
                    orderBy: { sort_order: 'asc' },
                },
            },
            orderBy: { sort_order: 'asc' },
        }) as any;
    }
}


