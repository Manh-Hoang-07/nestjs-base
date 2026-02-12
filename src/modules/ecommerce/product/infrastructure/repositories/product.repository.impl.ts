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

        // Price filtering - check variants
        // Strategy: Use sale_price if exists, otherwise use price
        // With composite indexes on (is_active, deleted_at, price/sale_price), this will be very efficient
        if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
            const priceFilter: any = {
                is_active: true,
                deleted_at: null,
            };

            // Build price conditions
            // We need to check: COALESCE(sale_price, price) BETWEEN min AND max
            // In Prisma, we do this by checking both fields with OR logic
            const priceConditions: any[] = [];

            if (filter.minPrice !== undefined && filter.maxPrice !== undefined) {
                // Both min and max: price range
                priceConditions.push(
                    // sale_price in range
                    {
                        sale_price: { gte: filter.minPrice, lte: filter.maxPrice }
                    },
                    // OR: no sale_price AND price in range
                    {
                        sale_price: null,
                        price: { gte: filter.minPrice, lte: filter.maxPrice }
                    }
                );
            } else if (filter.minPrice !== undefined) {
                // Only minimum price
                priceConditions.push(
                    { sale_price: { gte: filter.minPrice } },
                    { sale_price: null, price: { gte: filter.minPrice } }
                );
            } else if (filter.maxPrice !== undefined) {
                // Only maximum price
                priceConditions.push(
                    { sale_price: { lte: filter.maxPrice } },
                    { sale_price: null, price: { lte: filter.maxPrice } }
                );
            }

            priceFilter.OR = priceConditions;
            where.variants = { some: priceFilter };
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

    async findVariants(productId: number | bigint): Promise<any[]> {
        return this.prisma.productVariant.findMany({
            where: {
                product_id: this.toPrimaryKey(productId),
                is_active: true,
                deleted_at: null,
            },
            include: {
                attributes: {
                    include: {
                        attribute_value: true,
                    },
                },
            },
        });
    }
}
