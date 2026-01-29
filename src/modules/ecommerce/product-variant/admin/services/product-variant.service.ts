import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ProductVariant } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IProductVariantRepository, PRODUCT_VARIANT_REPOSITORY } from '../../domain/product-variant.repository';
import { CreateProductVariantDto } from '../dtos/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dtos/update-product-variant.dto';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class AdminProductVariantService extends BaseService<ProductVariant, IProductVariantRepository> {
  constructor(
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    protected readonly productVariantRepository: IProductVariantRepository,
    private readonly prisma: PrismaService,
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

    // Convert status to is_active if needed
    if (raw.status) {
      raw.is_active = raw.status === 'active';
      delete raw.status;
    }

    // Chỉ giữ lại các field hợp lệ theo Prisma ProductVariantCreateInput
    const allowedKeys = [
      'name',
      'sku',
      'price',
      'sale_price',
      'stock_quantity',
      'image',
      'is_active',
      'deleted_at',
      'product', // relation mapped ở trên
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
    if (!attrs || !Array.isArray(attrs) || attrs.length === 0) return;

    await this.prisma.productVariantAttribute.createMany({
      data: attrs
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
        .filter(Boolean) as any[],
      skipDuplicates: true,
    });
  }

  protected override async beforeUpdate(id: string | number | bigint, data: UpdateProductVariantDto): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Product Variant with ID ${id} not found`);
    }

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

    // Chỉ giữ lại các field hợp lệ theo Prisma ProductVariantUpdateInput
    const allowedKeys = [
      'name',
      'sku',
      'price',
      'sale_price',
      'stock_quantity',
      'image',
      'is_active',
      'deleted_at',
      'product', // relation mapped ở trên
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

    // Nếu FE không gửi attributes thì không động vào bảng junction (giữ nguyên)
    if (!Array.isArray(attrs)) {
      return;
    }

    // Xóa toàn bộ attributes cũ của variant và ghi lại từ payload mới
    await this.prisma.productVariantAttribute.deleteMany({
      where: { product_variant_id: entity.id },
    });

    if (attrs.length === 0) {
      return;
    }

    await this.prisma.productVariantAttribute.createMany({
      data: attrs
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
        .filter(Boolean) as any[],
      skipDuplicates: true,
    });
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

  /**
   * FE-friendly minimal payload (no nested attributes)
   */
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
    };
  }

  /**
   * Default payload: includes a lightweight attribute summary so FE can identify the variant.
   */
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

    return entity;
  }
}