import { Module } from '@nestjs/common';
import { PRODUCT_DIGITAL_ASSET_REPOSITORY } from './domain/product-digital-asset.repository';
import { ProductDigitalAssetRepository } from './infrastructure/product-digital-asset.repository.prisma';

@Module({
    providers: [
        {
            provide: PRODUCT_DIGITAL_ASSET_REPOSITORY,
            useClass: ProductDigitalAssetRepository,
        },
    ],
    exports: [PRODUCT_DIGITAL_ASSET_REPOSITORY],
})
export class ProductDigitalAssetRepositoryModule { }
