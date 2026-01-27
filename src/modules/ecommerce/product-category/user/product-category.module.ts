import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from '@/shared/entities/product-category.entity';
import { Product } from '@/shared/entities/product.entity';
import { UserProductCategoryService } from '@/modules/ecommerce/user/product-category/services/product-category.service';
import { UserProductCategoryController } from '@/modules/ecommerce/user/product-category/controllers/product-category.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductCategory,
      Product,
    ]),
  ],
  controllers: [
    UserProductCategoryController,
  ],
  providers: [
    UserProductCategoryService,
  ],
  exports: [
    UserProductCategoryService,
  ],
})
export class UserProductCategoryModule { }