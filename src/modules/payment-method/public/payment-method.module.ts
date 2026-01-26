import { Module } from '@nestjs/common';
import { PaymentMethodController } from '@/modules/payment-method/public/controllers/payment-method.controller';
import { PublicPaymentMethodService } from '@/modules/payment-method/public/services/payment-method.service';
import { PaymentMethodRepositoryModule } from '@/modules/payment-method/payment-method.repository.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
    imports: [
        RbacModule,
        PaymentMethodRepositoryModule,
    ],
    controllers: [PaymentMethodController],
    providers: [PublicPaymentMethodService],
    exports: [PublicPaymentMethodService],
})
export class PublicPaymentMethodModule { }
