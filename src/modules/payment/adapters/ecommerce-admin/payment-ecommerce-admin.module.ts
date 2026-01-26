import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@/shared/entities/payment.entity';
import { Order } from '@/shared/entities/order.entity';
import { AdminPaymentController } from './controllers/admin-payment.controller';
import { AdminEcommercePaymentService } from './services/admin-ecommerce-payment.service';
import { RbacModule } from '@/modules/rbac/rbac.module';
import { PublicOrderModule } from '@/modules/ecommerce/public/order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order]),
    RbacModule,
    PublicOrderModule,
  ],
  controllers: [AdminPaymentController],
  providers: [AdminEcommercePaymentService],
  exports: [AdminEcommercePaymentService],
})
export class PaymentEcommerceAdminModule {}


