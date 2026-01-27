import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@/common/base/services/crud.service';
import { ShippingMethod } from '@/shared/entities/shipping-method.entity';

@Injectable()
export class AdminShippingMethodService extends CrudService<ShippingMethod> {
  constructor(
    @InjectRepository(ShippingMethod)
    protected readonly shippingMethodRepository: Repository<ShippingMethod>,
  ) {
    super(shippingMethodRepository);
  }
}