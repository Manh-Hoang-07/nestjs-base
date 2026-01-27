import { Injectable } from '@nestjs/common';
import { Product, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IProductRepository, ProductFilter } from '../../domain/product.repository';

@Injectable()
export class ProductRepositoryImpl extends PrismaRepository<
    Product,
    Prisma.ProductWhereInput,
    Prisma.ProductCreateInput,
    Prisma.ProductUpdateInput,
    Prisma.ProductOrderByWithRelationInput
> implements IProductRepository {
    constructor(
        private readonly prisma: PrismaService,
    ) {
        super(prisma.product as any);
        this.defaultSelect = {
            id: true,
            name: true,
            slug: true,
            sku: true,
            description: true,
            short_description: true,
            min_stock_level: true,
            image: true,
            gallery: true,
            status: true,
            is_featured: true,
            is_variable: true,
            is_digital: true,
            download_limit: true,
            meta_title: true,
            meta_description: true,
            canonical_url: true,
            og_title: true,
            og_description: true,
            og_image: true,
            group_id: true,
            created_at: true,
            updated_at: true,
            categories: {
                select: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        }
                    }
                }
            },
            variants: {
                where: { deleted_at: null, is_active: true },
                select: {
                    id: true,
                    name: true,
                    sku: true,
                    price: true,
                    sale_price: true,
                    stock_quantity: true,
                    image: true,
                }
            }
        };
    }

    protected buildWhere(filter: ProductFilter): Prisma.ProductWhereInput {
        const where: Prisma.ProductWhereInput = {};

        if (filter.status) where.status = filter.status as any;
        if (filter.isFeatured !== undefined) where.is_featured = filter.isFeatured;
        if (filter.isVariable !== undefined) where.is_variable = filter.isVariable;
        if (filter.isDigital !== undefined) where.is_digital = filter.isDigital;
        if (filter.groupId) where.group_id = this.toPrimaryKey(filter.groupId);

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { slug: { contains: filter.search } },
                { sku: { contains: filter.search } },
            ];
        }

        if (filter.categorySlug) {
            where.categories = {
                some: {
                    category: { slug: filter.categorySlug },
                },
            };
        }

        if (filter.categoryId) {
            where.categories = {
                some: {
                    product_category_id: this.toPrimaryKey(filter.categoryId),
                },
            };
        }

        return where;
    }

    async findBySlug(slug: string): Promise<Product | null> {
        return this.findOne({ slug });
    }

    async findBySku(sku: string): Promise<Product | null> {
        return this.findOne({ sku });
    }

    async syncCategories(productId: number | bigint, categoryIds: (number | bigint)[]): Promise<void> {
        const id = this.toPrimaryKey(productId);

        // Delete existing relations
        await this.prisma.productProductCategory.deleteMany({
            where: { product_id: id }
        });

        // Add new relations
        if (categoryIds.length > 0) {
            await this.prisma.productProductCategory.createMany({
                data: categoryIds.map(catId => ({
                    product_id: id,
                    product_category_id: this.toPrimaryKey(catId)
                }))
            });
        }
    }
}
