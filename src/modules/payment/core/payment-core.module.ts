import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@/shared/entities/payment.entity';
import { Order } from '@/shared/entities/order.entity';
import { PaymentMethod } from '@/shared/entities/payment-method.entity';
import { PaymentProcessorService } from './services/payment-processor.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { VNPayGateway } from './gateways/vnpay.gateway';
import { MomoGateway } from './gateways/momo.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Order,
      PaymentMethod,
    ]),
  ],
  providers: [
    PaymentProcessorService,
    PaymentGatewayService,
    VNPayGateway,
    MomoGateway,
  ],
  exports: [PaymentProcessorService, PaymentGatewayService],
})
export class PaymentCoreModule {}


