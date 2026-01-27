import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingMethod } from '@/shared/entities/shipping-method.entity';
import { PublicShippingMethodService } from '@/modules/ecommerce/public/shipping-method/services/shipping-method.service';
import { PublicShippingMethodController } from '@/modules/ecommerce/public/shipping-method/controllers/shipping-method.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingMethod])],
  controllers: [PublicShippingMethodController],
  providers: [PublicShippingMethodService],
  exports: [PublicShippingMethodService],
})
export class PublicShippingMethodModule { }