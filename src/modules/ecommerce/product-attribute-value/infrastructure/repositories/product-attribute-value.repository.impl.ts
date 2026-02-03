import { Injectable } from '@nestjs/common';
import { ProductAttributeValue, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IProductAttributeValueRepository, ProductAttributeValueFilter } from '../../domain/product-attribute-value.repository';

@Injectable()
export class ProductAttributeValueRepositoryImpl extends PrismaRepository<
    ProductAttributeValue,
    Prisma.ProductAttributeValueWhereInput,
    Prisma.ProductAttributeValueCreateInput,
    Prisma.ProductAttributeValueUpdateInput,
    Prisma.ProductAttributeValueOrderByWithRelationInput
> implements IProductAttributeValueRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.productAttributeValue as any);
        this.defaultInclude = {
            attribute: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                }
            }
        };
    }

    protected buildWhere(filter: ProductAttributeValueFilter): Prisma.ProductAttributeValueWhereInput {
        const where: Prisma.ProductAttributeValueWhereInput = {};

        if (filter.attributeId) {
            where.product_attribute_id = this.toPrimaryKey(filter.attributeId);
        }
        if (filter.search) {
            where.OR = [
                { value: { contains: filter.search } },
                { label: { contains: filter.search } },
            ];
        }

        return where;
    }

    async findByAttributeId(attributeId: number | bigint): Promise<ProductAttributeValue[]> {
        return this.findMany({ attributeId });
    }
}


