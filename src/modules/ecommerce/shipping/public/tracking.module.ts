import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingHistory } from '@/shared/entities/tracking-history.entity';
import { Order } from '@/shared/entities/order.entity';
import { PublicTrackingController } from './controllers/tracking.controller';
import { TrackingService } from './services/tracking.service';
import { ShippingProviderService } from './services/shipping-provider.service';
import { GHNProvider } from './providers/ghn.provider';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrackingHistory, Order]),
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