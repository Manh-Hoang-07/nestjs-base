import { Module } from '@nestjs/common';
import { AdminProductAttributeValueService } from './services/product-attribute-value.service';
import { AdminProductAttributeValueController } from './controllers/product-attribute-value.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ProductAttributeValueRepositoryModule } from '../product-attribute-value.repository.module';

@Module({
  imports: [
    ProductAttributeValueRepositoryModule,
    RbacModule,
  ],
  controllers: [AdminProductAttributeValueController],
  providers: [AdminProductAttributeValueService],
  exports: [AdminProductAttributeValueService],
})
export class AdminProductAttributeValueModule { }