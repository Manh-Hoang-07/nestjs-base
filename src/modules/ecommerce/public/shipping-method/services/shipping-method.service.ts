import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@/common/base/services/crud.service';
import { ShippingMethod } from '@/shared/entities/shipping-method.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Injectable()
export class PublicShippingMethodService extends CrudService<ShippingMethod> {
  constructor(
    @InjectRepository(ShippingMethod)
    protected readonly shippingMethodRepository: Repository<ShippingMethod>,
  ) {
    super(shippingMethodRepository);
  }

  async findActive(): Promise<ShippingMethod[]> {
    return this.shippingMethodRepository.find({
      where: { status: BasicStatus.Active },
      order: { name: 'ASC' },
    });
  }

  async calculateShippingCost(
    shippingMethodId: number,
    cartValue: number,
    weight?: number,
    destination?: string,
  ): Promise<number> {
    const shippingMethod = await this.shippingMethodRepository.findOne({
      where: { id: shippingMethodId, status: BasicStatus.Active },
    });

    if (!shippingMethod) {
      throw new NotFoundException('Shipping method not found or inactive');
    }

    // Basic calculation logic - can be extended based on business requirements
    let cost = parseFloat(shippingMethod.base_cost);

    // Add weight-based cost if weight is provided (example implementation)
    // This would require additional fields in the entity for a real implementation
    if (weight) {
      // Example: $5 per kg over 5kg
      if (weight > 5) {
        cost += (weight - 5) * 5;
      }
    }

    // Add percentage-based cost if cart value is high (example implementation)
    // This would require additional fields in the entity for a real implementation
    if (cartValue > 1000) {
      cost += cartValue * 0.02; // 2% of cart value over $1000
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

  protected async beforeCreate(entity: ShippingMethod, createDto: any): Promise<boolean> {
    return true;
  }

  protected async beforeUpdate(entity: ShippingMethod, updateDto: any): Promise<boolean> {
    return true;
  }


}