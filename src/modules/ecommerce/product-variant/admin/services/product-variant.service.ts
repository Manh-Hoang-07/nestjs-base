import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ProductVariant } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IProductVariantRepository, PRODUCT_VARIANT_REPOSITORY } from '../../domain/product-variant.repository';
import { CreateProductVariantDto } from '../dtos/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dtos/update-product-variant.dto';
import { RequestContext } from '@/common/shared/utils/request-context.util';
import { verifyGroupOwnership } from '@/common/shared/utils/group-ownership.util';
import { IProductVariantAttributeRepository, PRODUCT_VARIANT_ATTRIBUTE_REPOSITORY } from '../../domain/product-variant-attribute.repository';

@Injectable()
export class AdminProductVariantService extends BaseService<ProductVariant, IProductVariantRepository> {
  constructor(
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    protected readonly productVariantRepository: IProductVariantRepository,
    @Inject(PRODUCT_VARIANT_ATTRIBUTE_REPOSITORY)
    private readonly attributeRepository: IProductVariantAttributeRepository,
  ) {
    super(productVariantRepository);
  }

  protected override async beforeCreate(data: CreateProductVariantDto): Promise<any> {
    const raw: any = { ...data };

    // Map product_id (from FE) -> Prisma relation `product.connect`
    if (raw.product_id !== undefined && raw.product_id !== null) {
      raw.product = {
        connect: { id: BigInt(raw.product_id) },
      };
      delete raw.product_id;
    }

    // Gán group_id từ product hoặc request context
    const groupId = RequestContext.get<number | null>('groupId');
    if (groupId) {
      raw.group_id = groupId;
    }

    // Convert status to is_active if needed
    if (raw.status) {
      raw.is_active = raw.status === 'active';
      delete raw.status;
    }

    // Chỉ giữ lại các field hợp lệ. LƯU Ý: Không cho phép set stock_quantity trực tiếp tại đây
    const allowedKeys = [
      'name',
      'sku',
      'price',
      'sale_price',
      'image',
      'is_active',
      'deleted_at',
      'product',
      'group_id',
    ];

    const payload: any = {};
    for (const key of allowedKeys) {
      if (raw[key] !== undefined) {
        payload[key] = raw[key];
      }
    }

    return payload;
  }

  protected override async afterCreate(entity: ProductVariant, data: CreateProductVariantDto): Promise<void> {
    const attrs = (data as any).attributes as
      | {
        product_attribute_id?: number;
        product_attribute_value_id?: number;
        attribute_id?: number;
        value_id?: number;
      }[]
      | undefined;

    if (attrs && Array.isArray(attrs) && attrs.length > 0) {
      await this.attributeRepository.createMany(
        attrs
          .map((a) => {
            const attributeId = a.product_attribute_id ?? a.attribute_id;
            const valueId = a.product_attribute_value_id ?? a.value_id;
            if (attributeId === undefined || valueId === undefined) return null;
            return {
              product_variant_id: entity.id,
              product_attribute_id: BigInt(attributeId),
              product_attribute_value_id: BigInt(valueId),
            };
          })
          .filter(Boolean) as any[]
      );
    }
  }

  protected override async beforeUpdate(id: string | number | bigint, data: UpdateProductVariantDto): Promise<any> {
    const entity = await this.productVariantRepository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Product Variant with ID ${id} not found`);
    }

    // Verify ownership
    verifyGroupOwnership(entity as any);

    const raw: any = { ...data };

    // Map product_id (from FE) -> Prisma relation `product.connect`
    if (raw.product_id !== undefined && raw.product_id !== null) {
      raw.product = {
        connect: { id: BigInt(raw.product_id) },
      };
      delete raw.product_id;
    }

    if (raw.status) {
      raw.is_active = raw.status === 'active';
      delete raw.status;
    }

    // Chỉ giữ lại các field hợp lệ. KHÔNG cho phép cập nhật stock_quantity trực tiếp.
    const allowedKeys = [
      'name',
      'sku',
      'price',
      'sale_price',
      'image',
      'is_active',
      'deleted_at',
      'product',
      'group_id',
    ];

    const payload: any = {};
    for (const key of allowedKeys) {
      if (raw[key] !== undefined) {
        payload[key] = raw[key];
      }
    }

    return payload;
  }

  protected override async afterUpdate(entity: ProductVariant, data: UpdateProductVariantDto): Promise<void> {
    const attrs = (data as any).attributes as
      | {
        product_attribute_id?: number;
        product_attribute_value_id?: number;
        attribute_id?: number;
        value_id?: number;
      }[]
      | undefined;

    if (Array.isArray(attrs)) {
      await this.attributeRepository.deleteMany({
        product_variant_id: entity.id,
      });

      if (attrs.length > 0) {
        await this.attributeRepository.createMany(
          attrs
            .map((a) => {
              const attributeId = a.product_attribute_id ?? a.attribute_id;
              const valueId = a.product_attribute_value_id ?? a.value_id;
              if (attributeId === undefined || valueId === undefined) return null;
              return {
                product_variant_id: entity.id,
                product_attribute_id: BigInt(attributeId),
                product_attribute_value_id: BigInt(valueId),
              };
            })
            .filter(Boolean) as any[]
        );
      }
    }
  }

  async softDelete(id: number | bigint): Promise<boolean> {
    const entity = await this.repository.findById(id);
    if (entity) verifyGroupOwnership(entity as any);
    return this.delete(id);
  }

  async restore(id: number | bigint): Promise<any> {
    return this.repository.update(id, { deleted_at: null } as any);
  }

  async searchVariants(productId: number, attributes: any): Promise<any> {
    return this.getList({ product_id: productId });
  }

  protected override async prepareFilters(filters?: any): Promise<any> {
    const prepared = { ...(filters || {}) };
    if (prepared.group_id === undefined) {
      const contextId = RequestContext.get<number>('contextId');
      const groupId = RequestContext.get<number | null>('groupId');
      if (contextId && contextId !== 1 && groupId) {
        prepared.group_id = groupId;
      }
    }
    return prepared;
  }

  getSimpleSelect() {
    return {
      id: true,
      product_id: true,
      name: true,
      sku: true,
      price: true,
      sale_price: true,
      stock_quantity: true,
      image: true,
      is_active: true,
      created_at: true,
      updated_at: true,
      group_id: true,
    };
  }

  getDefaultSelect() {
    return {
      ...this.getSimpleSelect(),
      attributes: {
        select: {
          id: true,
          product_attribute_id: true,
          product_attribute_value_id: true,
        },
      },
    };
  }

  getAttributesInclude() {
    return {
      attributes: {
        include: {
          attribute_value: {
            include: {
              attribute: true,
            },
          },
        },
      },
    };
  }

  override async getOne(id: string | number | bigint, options: any = {}): Promise<any> {
    const includeAttributes = options?.include_attributes === true || options?.include_attributes === 'true';

    const entity = await this.repository.findFirstRaw({
      where: { id } as any,
      ...(includeAttributes
        ? { include: this.getAttributesInclude() }
        : { select: this.getDefaultSelect() }),
    });

    if (!entity) {
      throw new NotFoundException(`Product Variant with ID ${id} not found`);
    }

    verifyGroupOwnership(entity as any);

    return entity;
  }

  async getBySku(sku: string, options: any = {}): Promise<any> {
    const includeAttributes = options?.include_attributes === true || options?.include_attributes === 'true';

    const entity = await this.repository.findFirstRaw({
      where: { sku, deleted_at: null } as any,
      ...(includeAttributes
        ? { include: this.getAttributesInclude() }
        : { select: this.getDefaultSelect() }),
    });

    if (!entity) {
      throw new NotFoundException(`Product Variant with SKU ${sku} not found`);
    }

    verifyGroupOwnership(entity as any);

    return entity;
  }
}