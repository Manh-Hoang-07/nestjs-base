import { Module } from '@nestjs/common';
import { PRODUCT_ATTRIBUTE_REPOSITORY } from '../domain/product-attribute.repository';
import { ProductAttributeRepositoryImpl } from '../infrastructure/repositories/product-attribute.repository.impl';

@Module({
    providers: [
        {
            provide: PRODUCT_ATTRIBUTE_REPOSITORY,
            useClass: ProductAttributeRepositoryImpl,
        },
    ],
    exports: [PRODUCT_ATTRIBUTE_REPOSITORY],
})
export class ProductAttributeRepositoryModule { }
