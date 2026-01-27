import { Module } from '@nestjs/common';
import { PublicProductCategoryController } from './controllers/product-category.controller';
import { PublicProductCategoryService } from './services/product-category.service';
import { ProductCategoryRepositoryModule } from '../product-category.repository.module';
import { ProductRepositoryModule } from '../../product/product.repository.module';

@Module({
  imports: [
    ProductCategoryRepositoryModule,
    ProductRepositoryModule,
  ],
  controllers: [PublicProductCategoryController],
  providers: [PublicProductCategoryService],
  exports: [PublicProductCategoryService],
})
export class PublicProductCategoryModule { }