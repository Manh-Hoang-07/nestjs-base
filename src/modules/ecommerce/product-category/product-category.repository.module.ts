import { Module } from '@nestjs/common';
import { PRODUCT_CATEGORY_REPOSITORY } from './domain/product-category.repository';
import { ProductCategoryRepositoryImpl } from './infrastructure/repositories/product-category.repository.impl';

@Module({
    providers: [
        {
            provide: PRODUCT_CATEGORY_REPOSITORY,
            useClass: ProductCategoryRepositoryImpl,
        },
    ],
    exports: [PRODUCT_CATEGORY_REPOSITORY],
})
export class ProductCategoryRepositoryModule { }
