import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@/shared/entities/product.entity';
import { ProductCategory } from '@/shared/entities/product-category.entity';
import { AdminProductService } from '@/modules/ecommerce/admin/product/services/product.service';
import { AdminProductController } from '@/modules/ecommerce/admin/product/controllers/product.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductCategory]),
    RbacModule,
  ],
  controllers: [AdminProductController],
  providers: [AdminProductService],
  exports: [AdminProductService],
})
export class AdminProductModule { }