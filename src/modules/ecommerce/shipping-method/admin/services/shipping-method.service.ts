import { Injectable, Inject } from '@nestjs/common';
import { ShippingMethod } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IShippingMethodRepository, SHIPPING_METHOD_REPOSITORY } from '../../domain/shipping-method.repository';

@Injectable()
export class AdminShippingMethodService extends BaseService<ShippingMethod, IShippingMethodRepository> {
  constructor(
    @Inject(SHIPPING_METHOD_REPOSITORY)
    protected readonly shippingMethodRepository: IShippingMethodRepository,
  ) {
    super(shippingMethodRepository);
  }
  async restore(id: number | bigint): Promise<boolean> {
    return this.repository.update(id, { deleted_at: null } as any) as Promise<any>;
  }
}