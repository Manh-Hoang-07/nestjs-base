import { Module } from '@nestjs/common';
import { PRODUCT_VARIANT_REPOSITORY } from './domain/product-variant.repository';
import { ProductVariantRepositoryImpl } from './infrastructure/repositories/product-variant.repository.impl';
import { PRODUCT_VARIANT_ATTRIBUTE_REPOSITORY } from './domain/product-variant-attribute.repository';
import { ProductVariantAttributeRepositoryImpl } from './infrastructure/repositories/product-variant-attribute.repository.impl';

@Module({
    providers: [
        {
            provide: PRODUCT_VARIANT_REPOSITORY,
            useClass: ProductVariantRepositoryImpl,
        },
        {
            provide: PRODUCT_VARIANT_ATTRIBUTE_REPOSITORY,
            useClass: ProductVariantAttributeRepositoryImpl,
        },
    ],
    exports: [PRODUCT_VARIANT_REPOSITORY, PRODUCT_VARIANT_ATTRIBUTE_REPOSITORY],
})
export class ProductVariantRepositoryModule { }
