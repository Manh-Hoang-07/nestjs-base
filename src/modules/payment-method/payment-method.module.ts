import { Module } from '@nestjs/common';
import { AdminPaymentMethodModule } from '@/modules/payment-method/admin/payment-method.module';
import { PublicPaymentMethodModule } from '@/modules/payment-method/public/payment-method.module';
import { PaymentMethodRepositoryModule } from '@/modules/payment-method/payment-method.repository.module';

@Module({
  imports: [
    AdminPaymentMethodModule,
    PublicPaymentMethodModule,
    PaymentMethodRepositoryModule,
  ],
  exports: [PaymentMethodRepositoryModule],
})
export class PaymentMethodModule { }