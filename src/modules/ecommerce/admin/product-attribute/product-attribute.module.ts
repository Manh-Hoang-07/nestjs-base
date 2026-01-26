import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductAttribute } from '@/shared/entities/product-attribute.entity';
import { AdminProductAttributeService } from '@/modules/ecommerce/admin/product-attribute/services/product-attribute.service';
import { AdminProductAttributeController } from '@/modules/ecommerce/admin/product-attribute/controllers/product-attribute.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductAttribute]),
    RbacModule,
  ],
  controllers: [AdminProductAttributeController],
  providers: [AdminProductAttributeService],
  exports: [AdminProductAttributeService],
})
export class AdminProductAttributeModule { }