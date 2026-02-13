import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/database/prisma/prisma.module';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PaymentProcessorService } from './services/payment-processor.service';
import { PaymentManagementService } from './services/payment-management.service';
import { PaymentGatewayService } from '../shared/payment-gateway.service';
import { VNPayGateway } from '../shared/gateways/vnpay.gateway';
import { CODGateway } from '../shared/gateways/cod.gateway';
import { PaymentRepositoryModule } from '../payment.repository.module';
import { OrderRepositoryModule } from '../../ecommerce/order/order.repository.module';

@Module({
    imports: [
        PrismaModule,
        PaymentRepositoryModule,
        OrderRepositoryModule,
    ],
    controllers: [PaymentController],
    providers: [
        PaymentService,
        PaymentProcessorService,
        PaymentManagementService,
        PaymentGatewayService,
        VNPayGateway,
        CODGateway,
    ],
    exports: [PaymentService, PaymentProcessorService, PaymentManagementService],
})
export class PublicPaymentModule { }
