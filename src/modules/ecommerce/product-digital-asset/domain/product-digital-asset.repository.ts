import { ProductDigitalAsset } from '@prisma/client';
import { IRepository } from '@/common/core/repositories/repository.interface';

export interface IProductDigitalAssetRepository extends IRepository<ProductDigitalAsset> {
    findAvailableAssets(productId: number | bigint, variantId: number | bigint | null, limit: number): Promise<ProductDigitalAsset[]>;
    markAsSold(assetIds: bigint[], orderItemId: bigint): Promise<any>;
    createMany(data: any[]): Promise<any>;
}

export const PRODUCT_DIGITAL_ASSET_REPOSITORY = 'PRODUCT_DIGITAL_ASSET_REPOSITORY';
