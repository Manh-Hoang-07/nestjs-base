import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicProductController } from '@/modules/ecommerce/public/product/controllers/product.controller';
import { PublicProductService } from '@/modules/ecommerce/public/product/services/product.service';
import { Product } from '@/shared/entities/product.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { ProductCategory } from '@/shared/entities/product-category.entity';
import { ProductVariantAttribute } from '@/shared/entities/product-variant-attribute.entity';
import { ProductAttributeValue } from '@/shared/entities/product-attribute-value.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      ProductCategory,
      ProductVariantAttribute,
      ProductAttributeValue,
    ]),
  ],
  controllers: [PublicProductController],
  providers: [PublicProductService],
  exports: [PublicProductService],
})
export class PublicProductModule { }