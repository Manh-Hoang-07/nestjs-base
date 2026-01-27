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
        const where: Prisma.ProductCategoryWhereInput = {};

        if (filter.status) where.status = filter.status as any;
        if (filter.parent_id !== undefined) {
            where.parent_id = filter.parent_id === null ? null : this.toPrimaryKey(filter.parent_id);
        }

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { slug: { contains: filter.search } },
            ];
        }

        return where;
    }

    async findBySlug(slug: string): Promise<ProductCategory | null> {
        return this.findOne({ slug });
    }

    async getTree(): Promise<ProductCategory[]> {
        return this.prisma.productCategory.findMany({
            where: { parent_id: null, deleted_at: null },
            include: {
                children: {
                    where: { deleted_at: null },
                    include: {
                        children: {
                            where: { deleted_at: null }
                        }
                    }
                }
            },
            orderBy: { sort_order: 'asc' }
        }) as any;
    }
}
