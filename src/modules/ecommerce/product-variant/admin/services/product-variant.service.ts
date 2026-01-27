import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ProductVariant } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IProductVariantRepository, PRODUCT_VARIANT_REPOSITORY } from '../../domain/product-variant.repository';
import { CreateProductVariantDto } from '../dtos/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dtos/update-product-variant.dto';

@Injectable()
export class AdminProductVariantService extends BaseService<ProductVariant, IProductVariantRepository> {
  constructor(
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    protected readonly productVariantRepository: IProductVariantRepository,
  ) {
    super(productVariantRepository);
  }

  protected override async beforeCreate(data: CreateProductVariantDto): Promise<any> {
    const payload: any = { ...data };
    // Convert status to is_active if needed
    if (payload.status) {
      payload.is_active = payload.status === 'active';
      delete payload.status;
    }
    return payload;
  }

  protected override async beforeUpdate(id: string | number | bigint, data: UpdateProductVariantDto): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Product Variant with ID ${id} not found`);
    }

    const payload: any = { ...data };
    if (payload.status) {
      payload.is_active = payload.status === 'active';
      delete payload.status;
    }

    return payload;
  }

  async softDelete(id: number | bigint): Promise<boolean> {
    return this.delete(id);
  }

  async restore(id: number | bigint): Promise<any> {
    return this.repository.update(id, { deleted_at: null } as any);
  }

  async searchVariants(productId: number, attributes: any): Promise<any> {
    // Placeholder implementation
    return this.getList({ product_id: productId });
  }
}