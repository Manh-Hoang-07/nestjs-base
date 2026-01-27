import { Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from './domain/product.repository';
import { ProductRepositoryImpl } from './infrastructure/repositories/product.repository.impl';

@Module({
    providers: [
        {
            provide: PRODUCT_REPOSITORY,
            useClass: ProductRepositoryImpl,
        },
    ],
    exports: [PRODUCT_REPOSITORY],
})
export class ProductRepositoryModule { }
