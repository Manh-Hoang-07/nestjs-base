import { Injectable } from '@nestjs/common';
import { ProductVariant, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IProductVariantRepository, ProductVariantFilter } from '../../domain/product-variant.repository';

@Injectable()
export class ProductVariantRepositoryImpl extends PrismaRepository<
    ProductVariant,
    Prisma.ProductVariantWhereInput,
    Prisma.ProductVariantCreateInput,
    Prisma.ProductVariantUpdateInput,
    Prisma.ProductVariantOrderByWithRelationInput
> implements IProductVariantRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.productVariant as any);
        this.defaultSelect = {
            id: true,
            product_id: true,
            name: true,
            sku: true,
            price: true,
            sale_price: true,
            stock_quantity: true,
            image: true,
            is_active: true,
            created_at: true,
            updated_at: true,
        };
    }

    protected buildWhere(filter: ProductVariantFilter): Prisma.ProductVariantWhereInput {
        const where: Prisma.ProductVariantWhereInput = {};

        if (filter.productId) where.product_id = this.toPrimaryKey(filter.productId);
        if (filter.sku) where.sku = filter.sku;
        if (filter.isActive !== undefined) where.is_active = filter.isActive;
        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { sku: { contains: filter.search } },
            ];
        }

        return where;
    }

    async findBySku(sku: string): Promise<ProductVariant | null> {
        return this.findOne({ sku });
    }
}
