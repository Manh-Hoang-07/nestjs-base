import { Injectable, Inject } from '@nestjs/common';
import { IPaymentRepository, PAYMENT_REPOSITORY } from '../../domain/payment.repository';
import { BaseService } from '@/common/core/services/base.service';
import { Payment } from '@prisma/client';

@Injectable()
export class PaymentManagementService extends BaseService<Payment, IPaymentRepository> {
    constructor(
        @Inject(PAYMENT_REPOSITORY)
        protected readonly paymentRepository: IPaymentRepository,
    ) {
        super(paymentRepository);
    }

    protected async prepareOptions(options: any) {
        const normalized = await super.prepareOptions(options);
        return {
            ...normalized,
            include: { payment_method: true }
        };
    }
}
