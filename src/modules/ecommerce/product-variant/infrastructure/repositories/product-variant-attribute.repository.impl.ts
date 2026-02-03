import { Injectable } from '@nestjs/common';
import { ProductVariantAttribute, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IProductVariantAttributeRepository, ProductVariantAttributeFilter } from '../../domain/product-variant-attribute.repository';

@Injectable()
export class ProductVariantAttributeRepositoryImpl extends PrismaRepository<
    ProductVariantAttribute,
    Prisma.ProductVariantAttributeWhereInput,
    Prisma.ProductVariantAttributeCreateInput,
    Prisma.ProductVariantAttributeUpdateInput,
    Prisma.ProductVariantAttributeOrderByWithRelationInput
> implements IProductVariantAttributeRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.productVariantAttribute as any);
        this.isSoftDelete = false;
    }

    protected buildWhere(filter: ProductVariantAttributeFilter): Prisma.ProductVariantAttributeWhereInput {
        const where: Prisma.ProductVariantAttributeWhereInput = {};
        if (filter.productVariantId) where.product_variant_id = this.toPrimaryKey(filter.productVariantId);
        return where;
    }

    async createMany(data: any[]): Promise<void> {
        await this.prisma.productVariantAttribute.createMany({
            data,
            skipDuplicates: true,
        });
    }
}
