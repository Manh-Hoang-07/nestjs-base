import { Module } from '@nestjs/common';
import { UserProductCategoryController } from './controllers/product-category.controller';
import { UserProductCategoryService } from './services/product-category.service';
import { ProductCategoryRepositoryModule } from '../product-category.repository.module';
import { ProductRepositoryModule } from '@/modules/ecommerce/product/product.repository.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [
    ProductCategoryRepositoryModule,
    ProductRepositoryModule,
    RbacModule,
  ],
  controllers: [
    UserProductCategoryController,
  ],
  providers: [
    UserProductCategoryService,
  ],
  exports: [
    UserProductCategoryService,
  ],
})
export class UserProductCategoryModule { }