import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductAttributeValue } from '@/shared/entities/product-attribute-value.entity';
import { AdminProductAttributeValueService } from '@/modules/ecommerce/admin/product-attribute-value/services/product-attribute-value.service';
import { AdminProductAttributeValueController } from '@/modules/ecommerce/admin/product-attribute-value/controllers/product-attribute-value.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductAttributeValue]),
    RbacModule,
  ],
  controllers: [AdminProductAttributeValueController],
  providers: [AdminProductAttributeValueService],
  exports: [AdminProductAttributeValueService],
})
export class AdminProductAttributeValueModule { }