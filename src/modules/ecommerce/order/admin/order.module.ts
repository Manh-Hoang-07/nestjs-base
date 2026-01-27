import { Module } from '@nestjs/common';
import { AdminOrderService } from './services/order.service';
import { AdminOrderController } from './controllers/order.controller';
import { OrderRepositoryModule } from '../order.repository.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [
    OrderRepositoryModule,
    RbacModule,
  ],
  controllers: [AdminOrderController],
  providers: [AdminOrderService],
  exports: [AdminOrderService],
})
export class AdminOrderModule { }