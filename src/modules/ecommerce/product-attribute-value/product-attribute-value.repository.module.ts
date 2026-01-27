import { Module } from '@nestjs/common';
import { PRODUCT_ATTRIBUTE_VALUE_REPOSITORY } from './domain/product-attribute-value.repository';
import { ProductAttributeValueRepositoryImpl } from './infrastructure/repositories/product-attribute-value.repository.impl';

@Module({
    providers: [
        {
            provide: PRODUCT_ATTRIBUTE_VALUE_REPOSITORY,
            useClass: ProductAttributeValueRepositoryImpl,
        },
    ],
    exports: [PRODUCT_ATTRIBUTE_VALUE_REPOSITORY],
})
export class ProductAttributeValueRepositoryModule { }
