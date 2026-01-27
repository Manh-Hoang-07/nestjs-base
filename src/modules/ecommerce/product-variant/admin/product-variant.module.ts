import { Module } from '@nestjs/common';
import { AdminProductVariantService } from './services/product-variant.service';
import { AdminProductVariantController } from './controllers/product-variant.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ProductVariantRepositoryModule } from '../product-variant.repository.module';

@Module({
  imports: [
    ProductVariantRepositoryModule,
    RbacModule,
  ],
  controllers: [AdminProductVariantController],
  providers: [AdminProductVariantService],
  exports: [AdminProductVariantService],
})
export class AdminProductVariantModule { }