import { Module } from '@nestjs/common';
import { PublicPaymentModule } from './public/payment.module';

@Module({
    imports: [PublicPaymentModule],
    exports: [PublicPaymentModule],
})
export class PaymentModule { }
