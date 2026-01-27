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

  /**
   * Map dữ liệu từ DTO sang schema Prisma:
   * - `cost` (DTO) -> `price` (DB)
   */
  private mapCostToPrice(data: any): any {
    if (!data) return data;
    const { cost, ...rest } = data;
    return {
      ...rest,
      ...(typeof cost !== 'undefined' ? { price: cost } : {}),
    };
  }

  protected async beforeCreate(data: any): Promise<any> {
    return this.mapCostToPrice(data);
  }

  protected async beforeUpdate(id: string | number | bigint, data: any): Promise<any> {
    return this.mapCostToPrice(data);
  }

  async restore(id: number | bigint): Promise<boolean> {
    return this.repository.update(id, { deleted_at: null } as any) as Promise<any>;
  }
}