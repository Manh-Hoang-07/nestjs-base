import { Injectable, Inject } from '@nestjs/common';
import { BaseService } from '@/common/core/services/base.service';
import { IPaymentMethodRepository, PAYMENT_METHOD_REPOSITORY } from '@/modules/payment-method/domain/payment-method.repository';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentMethodService extends BaseService<PaymentMethod, IPaymentMethodRepository> {
  constructor(
    @Inject(PAYMENT_METHOD_REPOSITORY)
    protected readonly repository: IPaymentMethodRepository,
  ) {
    super(repository);
  }

  /**
   * Filter handling
   */
  protected async prepareFilters(filters: any): Promise<any> {
    const where: any = {};

    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q } },
        { code: { contains: filters.q } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    return where;
  }

  /**
   * Clean payload before create
   */
  protected async beforeCreate(data: any): Promise<any> {
    // Remove legacy fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { is_active, display_order, icon, updated_user_id, ...validData } = data;

    // Default status if missing
    if (!validData.status) {
      validData.status = 'active';
    }

    return validData;
  }

  /**
   * Clean payload before update
   */
  protected async beforeUpdate(id: string | number | bigint, data: any): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { is_active, display_order, icon, updated_user_id, ...validData } = data;
    return validData;
  }
}