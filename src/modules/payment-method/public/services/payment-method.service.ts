import { Injectable, Inject } from '@nestjs/common';
import { BaseService } from '@/common/core/services/base.service';
import { IPaymentMethodRepository, PAYMENT_METHOD_REPOSITORY } from '@/modules/payment-method/domain/payment-method.repository';
import { PaymentMethod } from '@prisma/client';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

@Injectable()
export class PublicPaymentMethodService extends BaseService<PaymentMethod, IPaymentMethodRepository> {
    constructor(
        @Inject(PAYMENT_METHOD_REPOSITORY)
        protected readonly repository: IPaymentMethodRepository,
    ) {
        super(repository);
    }

    /**
     * Filter handling for Public
     */
    protected async prepareFilters(filters: any): Promise<any> {
        const where: any = { ...filters };

        // Always enforce Active status for public
        where.status = BasicStatus.active;

        if (filters.q) {
            where.OR = [
                { name: { contains: filters.q } },
                { code: { contains: filters.q } },
            ];
        }

        if (filters.type) {
            where.type = filters.type;
        }

        return where;
    }
}
