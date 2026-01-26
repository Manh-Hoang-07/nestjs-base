import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentCoreModule } from '@/modules/payment/core/payment-core.module';
import { EcommercePaymentService } from './services/ecommerce-payment.service';
import { PublicOrderModule } from '@/modules/ecommerce/public/order/order.module';
import { PublicPaymentController } from '@/modules/payment/adapters/ecommerce/controllers/public-payment.controller';
import { Order } from '@/shared/entities/order.entity';
import { Payment } from '@/shared/entities/payment.entity';

@Module({
  imports: [
    PaymentCoreModule,
    PublicOrderModule,
    TypeOrmModule.forFeature([Order, Payment]),
  ],
  controllers: [PublicPaymentController],
  providers: [EcommercePaymentService],
  exports: [EcommercePaymentService],
})
export class PaymentEcommerceModule {}
