import { Module } from '@nestjs/common';
import { PRODUCT_VARIANT_REPOSITORY } from './domain/product-variant.repository';
import { ProductVariantRepositoryImpl } from './infrastructure/repositories/product-variant.repository.impl';

@Module({
    providers: [
        {
            provide: PRODUCT_VARIANT_REPOSITORY,
            useClass: ProductVariantRepositoryImpl,
        },
    ],
    exports: [PRODUCT_VARIANT_REPOSITORY],
})
export class ProductVariantRepositoryModule { }
