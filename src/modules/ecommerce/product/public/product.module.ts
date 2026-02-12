import { Module } from '@nestjs/common';
import { PublicProductController } from './controllers/product.controller';
import { PublicProductService } from './services/product.service';
import { ProductRepositoryModule } from '../product.repository.module';
import { CategoryCacheService } from '../infrastructure/services/category-cache.service';
import { ProductPriceSyncService } from '../infrastructure/services/product-price-sync.service';

@Module({
  imports: [
    ProductRepositoryModule,
  ],
  controllers: [PublicProductController],
  providers: [
    PublicProductService,
    CategoryCacheService,
    ProductPriceSyncService,
  ],
  exports: [
    PublicProductService,
    CategoryCacheService,
    ProductPriceSyncService,
  ],
})
export class PublicProductModule { }