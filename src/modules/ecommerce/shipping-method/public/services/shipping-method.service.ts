import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ShippingMethod } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IShippingMethodRepository, SHIPPING_METHOD_REPOSITORY } from '../../domain/shipping-method.repository';
import { BasicStatus } from '@/shared/enums';

@Injectable()
export class PublicShippingMethodService extends BaseService<ShippingMethod, IShippingMethodRepository> {
  constructor(
    @Inject(SHIPPING_METHOD_REPOSITORY)
    protected readonly shippingMethodRepository: IShippingMethodRepository,
  ) {
    super(shippingMethodRepository);
  }

  async findActive(): Promise<ShippingMethod[]> {
    const result = await this.shippingMethodRepository.findAll({
      filter: { status: BasicStatus.active },
      sort: 'name:ASC',
      limit: 1000
    });
    return result.data;
  }

  async calculateShippingCost(
    shippingMethodId: number | bigint,
    cartValue: number,
    weight?: number,
    destination?: string,
  ): Promise<number> {
    const shippingMethod = await this.shippingMethodRepository.findById(shippingMethodId);

    if (!shippingMethod || shippingMethod.status !== BasicStatus.active) {
      throw new NotFoundException('Shipping method not found or inactive');
    }

    // Basic calculation logic - base on decimal price from prisma
    let cost = Number(shippingMethod.price);

    // weight-based and cart-value based logic from old service
    if (weight && weight > 5) {
      cost += (weight - 5) * 5000; // Example 5000 VND per kg
    }

    if (cartValue > 1000000) {
      cost += cartValue * 0.02; // 2% of cart value over 1M
    }

    return cost;
  }

  async calculateShippingCostWithDetails(calculateDto: any) {
    const cost = await this.calculateShippingCost(
      calculateDto.shipping_method_id,
      calculateDto.cart_value,
      calculateDto.weight,
      calculateDto.destination,
    );

    return {
      shipping_method_id: calculateDto.shipping_method_id,
      cart_value: calculateDto.cart_value,
      weight: calculateDto.weight,
      destination: calculateDto.destination,
      shipping_cost: cost,
    };
  }
}

