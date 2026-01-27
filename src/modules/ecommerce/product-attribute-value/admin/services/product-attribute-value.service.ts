import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@/common/base/services/crud.service';
import { ProductAttributeValue } from '@/shared/entities/product-attribute-value.entity';

@Injectable()
export class AdminProductAttributeValueService extends CrudService<ProductAttributeValue> {
  constructor(
    @InjectRepository(ProductAttributeValue)
    protected readonly productAttributeValueRepository: Repository<ProductAttributeValue>,
  ) {
    super(productAttributeValueRepository);
  }

  async findByAttributeId(attributeId: number): Promise<ProductAttributeValue[]> {
    return this.productAttributeValueRepository.find({
      where: { product_attribute_id: attributeId },
      relations: ['attribute'],
      order: { sort_order: 'ASC', value: 'ASC' },
    });
  }
}