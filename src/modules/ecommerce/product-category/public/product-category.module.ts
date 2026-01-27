import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicProductCategoryController } from '@/modules/ecommerce/public/product-category/controllers/product-category.controller';
import { PublicProductCategoryService } from '@/modules/ecommerce/public/product-category/services/product-category.service';
import { ProductCategory } from '@/shared/entities/product-category.entity';
import { Product } from '@/shared/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductCategory,
      Product,
    ]),
  ],
  controllers: [PublicProductCategoryController],
  providers: [PublicProductCategoryService],
  exports: [PublicProductCategoryService],
})
export class PublicProductCategoryModule { }