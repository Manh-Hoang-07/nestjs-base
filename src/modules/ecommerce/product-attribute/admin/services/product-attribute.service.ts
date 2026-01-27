import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions, DeepPartial } from 'typeorm';
import { CrudService } from '@/common/base/services/crud.service';
import { ProductAttribute } from '@/shared/entities/product-attribute.entity';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { ResponseRef } from '@/common/base/utils/response-ref.helper';

@Injectable()
export class AdminProductAttributeService extends CrudService<ProductAttribute> {
  constructor(
    @InjectRepository(ProductAttribute)
    protected readonly productAttributeRepository: Repository<ProductAttribute>,
  ) {
    super(productAttributeRepository);
  }

  /**
   * Hook trước khi tạo - sử dụng ensureSlug từ base
   */
  protected async beforeCreate(
    entity: ProductAttribute,
    createDto: DeepPartial<ProductAttribute>,
    response?: ResponseRef<ProductAttribute | null>
  ): Promise<boolean> {
    await this.ensureSlug(createDto);
    return true;
  }

  /**
   * Hook trước khi update - sử dụng ensureSlug từ base
   */
  protected async beforeUpdate(
    entity: ProductAttribute,
    updateDto: DeepPartial<ProductAttribute>,
    response?: ResponseRef<ProductAttribute | null>
  ): Promise<boolean> {
    await this.ensureSlug(updateDto, entity.id, entity.slug);
    return true;
  }
}