import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/database/prisma/prisma.module';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PaymentGatewayService } from '../shared/payment-gateway.service';
import { VNPayGateway } from '../shared/gateways/vnpay.gateway';
import { CODGateway } from '../shared/gateways/cod.gateway';

@Module({
    imports: [PrismaModule],
    controllers: [PaymentController],
    providers: [
        PaymentService,
        PaymentGatewayService,
        VNPayGateway,
        CODGateway,
    ],
    exports: [PaymentService],
})
export class PublicPaymentModule { }
