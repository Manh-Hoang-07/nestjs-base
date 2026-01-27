import { Module } from '@nestjs/common';
import { PublicShippingMethodService } from './services/shipping-method.service';
import { PublicShippingMethodController } from './controllers/shipping-method.controller';
import { ShippingMethodRepositoryModule } from '../shipping-method.repository.module';

@Module({
  imports: [
    ShippingMethodRepositoryModule,
  ],
  controllers: [
    PublicShippingMethodController,
  ],
  providers: [
    PublicShippingMethodService,
  ],
  exports: [
    PublicShippingMethodService,
  ],
})
export class PublicShippingMethodModule { }