import { Injectable } from '@nestjs/common';
import { ProductAttribute, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IProductAttributeRepository, ProductAttributeFilter } from '../../domain/product-attribute.repository';

@Injectable()
export class ProductAttributeRepositoryImpl extends PrismaRepository<
    ProductAttribute,
    Prisma.ProductAttributeWhereInput,
    Prisma.ProductAttributeCreateInput,
    Prisma.ProductAttributeUpdateInput,
    Prisma.ProductAttributeOrderByWithRelationInput
> implements IProductAttributeRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.productAttribute as any);
        this.defaultSelect = {
            id: true,
            name: true,
            code: true,
            type: true,
            is_filterable: true,
            is_required: true,
            sort_order: true,
            created_at: true,
            updated_at: true,
            values: {
                where: { deleted_at: null },
                orderBy: { sort_order: 'asc' }
            }
        };
    }

    protected buildWhere(filter: ProductAttributeFilter): Prisma.ProductAttributeWhereInput {
        const where: Prisma.ProductAttributeWhereInput = {};

        if (filter.code) where.code = filter.code;
        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { code: { contains: filter.search } },
            ];
        }

        return where;
    }

    async findByCode(code: string): Promise<ProductAttribute | null> {
        return this.findOne({ code });
    }
}
