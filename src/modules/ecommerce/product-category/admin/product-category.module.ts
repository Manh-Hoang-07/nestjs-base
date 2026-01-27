import { Module } from '@nestjs/common';
import { AdminProductCategoryService } from './services/product-category.service';
import { AdminProductCategoryController } from './controllers/product-category.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ProductCategoryRepositoryModule } from '../product-category.repository.module';

@Module({
  imports: [
    ProductCategoryRepositoryModule,
    RbacModule,
  ],
  controllers: [AdminProductCategoryController],
  providers: [AdminProductCategoryService],
  exports: [AdminProductCategoryService],
})
export class AdminProductCategoryModule { }