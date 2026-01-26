import { Module } from '@nestjs/common';
import { PaymentMethodController } from '@/modules/payment-method/admin/controllers/payment-method.controller';
import { PaymentMethodService } from '@/modules/payment-method/admin/services/payment-method.service';
import { PaymentMethodRepositoryModule } from '@/modules/payment-method/payment-method.repository.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
    imports: [
        RbacModule,
        PaymentMethodRepositoryModule,
    ],
    controllers: [PaymentMethodController],
    providers: [PaymentMethodService],
    exports: [PaymentMethodService],
})
export class AdminPaymentMethodModule { }
