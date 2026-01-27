import { Module } from '@nestjs/common';
import { PublicTrackingController } from './controllers/tracking.controller';
import { TrackingService } from './services/tracking.service';
import { ShippingProviderService } from './services/shipping-provider.service';
import { GHNProvider } from './providers/ghn.provider';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { TrackingHistoryRepositoryModule } from '../tracking-history.repository.module';
import { OrderRepositoryModule } from '../../order/order.repository.module';

@Module({
  imports: [
    TrackingHistoryRepositoryModule,
    OrderRepositoryModule,
    RbacModule,
  ],
  controllers: [PublicTrackingController],
  providers: [
    TrackingService,
    ShippingProviderService,
    GHNProvider,
  ],
  exports: [TrackingService, ShippingProviderService],
})
export class TrackingModule { }