import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from '@/shared/entities/product-category.entity';
import { AdminProductCategoryService } from './services/product-category.service';
import { AdminProductCategoryController } from './controllers/product-category.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductCategory]),
    RbacModule,
  ],
  controllers: [AdminProductCategoryController],
  providers: [AdminProductCategoryService],
  exports: [AdminProductCategoryService],
})
export class AdminProductCategoryModule { }