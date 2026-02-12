import { Module } from '@nestjs/common';
import { AdminProductVariantService } from './services/product-variant.service';
import { AdminProductVariantController } from './controllers/product-variant.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ProductVariantRepositoryModule } from '../product-variant.repository.module';
import { ProductPriceSyncService } from '@/modules/ecommerce/product/infrastructure/services/product-price-sync.service';

@Module({
  imports: [
    ProductVariantRepositoryModule,
    RbacModule,
  ],
  controllers: [AdminProductVariantController],
  providers: [
    AdminProductVariantService,
    ProductPriceSyncService,
  ],
  exports: [AdminProductVariantService],
})
export class AdminProductVariantModule { }