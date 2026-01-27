import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@/shared/entities/product.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { UserProductService } from '@/modules/ecommerce/user/product/services/product.service';
import { UserProductController } from '@/modules/ecommerce/user/product/controllers/product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
    ]),
  ],
  controllers: [
    UserProductController,
  ],
  providers: [
    UserProductService,
  ],
  exports: [
    UserProductService,
  ],
})
export class UserProductModule { }