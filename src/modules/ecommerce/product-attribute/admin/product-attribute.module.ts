import { Module } from '@nestjs/common';
import { AdminProductAttributeService } from './services/product-attribute.service';
import { AdminProductAttributeController } from './controllers/product-attribute.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ProductAttributeRepositoryModule } from '../product-attribute.repository.module';

@Module({
  imports: [
    ProductAttributeRepositoryModule,
    RbacModule,
  ],
  controllers: [AdminProductAttributeController],
  providers: [AdminProductAttributeService],
  exports: [AdminProductAttributeService],
})
export class AdminProductAttributeModule { }