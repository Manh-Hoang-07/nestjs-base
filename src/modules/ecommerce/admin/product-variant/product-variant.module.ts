import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { AdminProductVariantService } from '@/modules/ecommerce/admin/product-variant/services/product-variant.service';
import { AdminProductVariantController } from '@/modules/ecommerce/admin/product-variant/controllers/product-variant.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductVariant]),
    RbacModule,
  ],
  controllers: [AdminProductVariantController],
  providers: [AdminProductVariantService],
  exports: [AdminProductVariantService],
})
export class AdminProductVariantModule { }