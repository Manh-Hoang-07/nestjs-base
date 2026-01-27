import { Module } from '@nestjs/common';
import { AdminProductService } from './services/product.service';
import { AdminProductController } from './controllers/product.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';
import { ProductRepositoryModule } from '../product.repository.module';

@Module({
  imports: [
    ProductRepositoryModule,
    RbacModule,
  ],
  controllers: [AdminProductController],
  providers: [AdminProductService],
  exports: [AdminProductService],
})
export class AdminProductModule { }