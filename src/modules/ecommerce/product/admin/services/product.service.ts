import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IProductRepository, PRODUCT_REPOSITORY } from '../../domain/product.repository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { RequestContext } from '@/common/shared/utils/request-context.util';
import { verifyGroupOwnership } from '@/common/shared/utils/group-ownership.util';
import { StringUtil } from '@/core/utils/string.util';

@Injectable()
export class AdminProductService extends BaseService<Product, IProductRepository> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    protected readonly productRepository: IProductRepository,
  ) {
    super(productRepository);
  }

  /**
   * Chuẩn bị filters theo group/context
   */
  protected override async prepareFilters(
    filters?: any,
    _options?: any,
  ): Promise<any> {
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

  /**
   * Hook trước khi tạo
   */
  protected override async beforeCreate(data: CreateProductDto): Promise<any> {
    const payload = { ...data };

    // Xử lý slug
    if (!payload.slug) {
      payload.slug = StringUtil.toSlug(payload.name);
    }

    // Check slug duplicate
    const existing = payload.slug ? await this.productRepository.findBySlug(payload.slug) : null;
    if (existing) {
      payload.slug = `${payload.slug}-${Date.now()}`;
    }

    // Gán group_id nếu có
    const groupId = RequestContext.get<number | null>('groupId');
    if (groupId) {
      (payload as any).group_id = groupId;
    }

    // Tách category_ids ra để xử lý sau (afterCreate)
    if ((payload as any).category_ids !== undefined) {
      delete (payload as any).category_ids;
    }
    return payload;
  }

  /**
   * Hook sau khi tạo - xử lý các quan hệ m-m
   */
  protected override async afterCreate(entity: Product, data: CreateProductDto): Promise<void> {
    if (data.category_ids && data.category_ids.length > 0) {
      await this.productRepository.syncCategories(entity.id, data.category_ids.map(id => BigInt(id)));
    }
  }

  /**
   * Hook trước khi update
   */
  protected override async beforeUpdate(id: string | number | bigint, data: UpdateProductDto): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Verify ownership
    verifyGroupOwnership(entity);

    const payload = { ...data };

    // Xử lý slug if name changed
    if (payload.name && !payload.slug) {
      payload.slug = StringUtil.toSlug(payload.name);
    }

    if (payload.slug && payload.slug !== entity.slug) {
      const existing = await this.productRepository.findBySlug(payload.slug);
      if (existing && existing.id !== entity.id) {
        payload.slug = `${payload.slug}-${Date.now()}`;
      }
    }

    // category_ids là field “ảo” để sync quan hệ m-m, không phải cột của Product
    // (xử lý trong afterUpdate thông qua this.productRepository.syncCategories)
    if ((payload as any).category_ids !== undefined) {
      delete (payload as any).category_ids;
    }

    return payload;
  }

  /**
   * Hook sau khi update
   */
  protected override async afterUpdate(entity: Product, data: UpdateProductDto): Promise<void> {
    if (data.category_ids) {
      await this.productRepository.syncCategories(entity.id, data.category_ids.map(id => BigInt(id)));
    }
  }

  /**
   * Override getOne để verify ownership
   */
  override async getOne(id: string | number | bigint): Promise<Product> {
    const product = await super.getOne(id);
    verifyGroupOwnership(product);
    return product;
  }

  /**
   * Hook trước khi xóa để verify ownership
   */
  protected override async beforeDelete(id: string | number | bigint): Promise<boolean> {
    const entity = await this.repository.findById(id);
    if (entity) {
      verifyGroupOwnership(entity);
    }
    return true;
  }

  /**
   * Transform entity để flatten categories và thêm product_category_ids
   */
  protected override transform(entity: any): any {
    if (!entity) return null;

    // Gọi transform của parent để xử lý BigInt
    const baseTransformed = super.transform(entity as any) as any;
    if (!baseTransformed) return null;

    const transformed: any = { ...baseTransformed };

    // Transform categories từ nested structure sang flat array
    if (transformed.categories && Array.isArray(transformed.categories)) {
      // Flatten: từ [{ category: {...} }] sang [{...}]
      transformed.categories = transformed.categories
        .map((item: any) => item?.category)
        .filter(Boolean);
      
      // Thêm product_category_ids (đã được convert BigInt sang number bởi parent transform)
      transformed.product_category_ids = transformed.categories.map((cat: any) => cat.id);
    } else {
      transformed.categories = [];
      transformed.product_category_ids = [];
    }

    return transformed;
  }
}