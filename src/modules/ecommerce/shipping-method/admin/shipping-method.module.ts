import { Module } from '@nestjs/common';
import { AdminShippingMethodService } from './services/shipping-method.service';
import { AdminShippingMethodController } from './controllers/shipping-method.controller';
import { ShippingMethodRepositoryModule } from '../shipping-method.repository.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [
    ShippingMethodRepositoryModule,
    RbacModule,
  ],
  controllers: [AdminShippingMethodController],
  providers: [AdminShippingMethodService],
  exports: [AdminShippingMethodService],
})
export class AdminShippingMethodModule { }