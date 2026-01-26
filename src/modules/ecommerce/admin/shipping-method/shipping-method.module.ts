import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingMethod } from '@/shared/entities/shipping-method.entity';
import { AdminShippingMethodService } from '@/modules/ecommerce/admin/shipping-method/services/shipping-method.service';
import { AdminShippingMethodController } from '@/modules/ecommerce/admin/shipping-method/controllers/shipping-method.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShippingMethod]),
    RbacModule,
  ],
  controllers: [AdminShippingMethodController],
  providers: [AdminShippingMethodService],
  exports: [AdminShippingMethodService],
})
export class AdminShippingMethodModule { }