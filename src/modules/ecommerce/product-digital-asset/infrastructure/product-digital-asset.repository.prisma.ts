import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { ProductDigitalAsset, Prisma } from '@prisma/client';
import { IProductDigitalAssetRepository } from '../domain/product-digital-asset.repository';
import { PrismaRepository } from '@/common/core/repositories/prisma.repository';

@Injectable()
export class ProductDigitalAssetRepository extends PrismaRepository<
    ProductDigitalAsset,
    Prisma.ProductDigitalAssetWhereInput,
    Prisma.ProductDigitalAssetCreateInput,
    Prisma.ProductDigitalAssetUpdateInput,
    Prisma.ProductDigitalAssetOrderByWithRelationInput
> implements IProductDigitalAssetRepository {

    constructor(private readonly prisma: PrismaService) {
        super(prisma.productDigitalAsset);
        this.isSoftDelete = false; // ProductDigitalAsset might not have deleted_at
    }

    protected buildWhere(filter: Record<string, any>): Prisma.ProductDigitalAssetWhereInput {
        const where: Prisma.ProductDigitalAssetWhereInput = {};

        if (filter.product_id) where.product_id = BigInt(filter.product_id);
        if (filter.product_variant_id) where.product_variant_id = BigInt(filter.product_variant_id);
        if (filter.status) where.status = filter.status;
        if (filter.id) where.id = BigInt(filter.id);

        return where;
    }

    async findAvailableAssets(productId: number | bigint, variantId: number | bigint | null, limit: number): Promise<ProductDigitalAsset[]> {
        return this.prisma.productDigitalAsset.findMany({
            where: {
                product_id: BigInt(productId),
                product_variant_id: variantId ? BigInt(variantId) : null,
                status: 'available',
            },
            take: limit,
            orderBy: { created_at: 'asc' },
        });
    }

    async markAsSold(assetIds: bigint[], orderItemId: bigint): Promise<any> {
        return this.prisma.productDigitalAsset.updateMany({
            where: {
                id: { in: assetIds },
            },
            data: {
                status: 'sold',
                order_item_id: orderItemId,
                sold_at: new Date(),
            },
        });
    }

    async createMany(data: any[]): Promise<any> {
        if (this.delegate.createMany) {
            return this.delegate.createMany({ data });
        }
        throw new Error('createMany not supported for this model delegate');
    }
}
