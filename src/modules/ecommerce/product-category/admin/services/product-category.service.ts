import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ProductCategory } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IProductCategoryRepository, PRODUCT_CATEGORY_REPOSITORY } from '../../domain/product-category.repository';
import { CreateProductCategoryDto } from '../dtos/create-product-category.dto';
import { UpdateProductCategoryDto } from '../dtos/update-product-category.dto';
import { slugify } from '@/common/shared/utils/string.util';
import { RequestContext } from '@/common/shared/utils/request-context.util';
import { verifyGroupOwnership } from '@/common/shared/utils/group-ownership.util';

@Injectable()
export class AdminProductCategoryService extends BaseService<ProductCategory, IProductCategoryRepository> {
  constructor(
    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    protected readonly productCategoryRepository: IProductCategoryRepository,
  ) {
    super(productCategoryRepository);
    this.autoAddGroupId = true;
  }

  async getSimpleList(query: any) {
    return this.getList({ ...query, limit: 1000 });
  }

  async findTree() {
    const groupId = RequestContext.get<number | null>('groupId');
    return this.productCategoryRepository.getTree(groupId);
  }

  async findRootCategories() {
    const groupId = RequestContext.get<number | null>('groupId');
    return this.productCategoryRepository.findMany({
      parent_id: null,
      group_id: groupId as any // Repository will handle Global OR Specific
    } as any);
  }

  async findChildren(parentId: number | bigint) {
    const groupId = RequestContext.get<number | null>('groupId');
    return this.productCategoryRepository.findMany({
      parent_id: parentId,
      group_id: groupId as any
    } as any);
  }

  /**
   * Chuẩn bị filters theo group/context
   */
  protected override async prepareFilters(filters?: any): Promise<any> {
    const prepared = { ...(filters || {}) };
    if (prepared.group_id === undefined) {
      Object.assign(prepared, this.getGroupFilter());
    }
    return prepared;
  }

  async restore(id: number | bigint) {
    return this.productCategoryRepository.update(id, { deleted_at: null } as any);
  }

  protected override async beforeCreate(data: CreateProductCategoryDto): Promise<any> {
    const payload = await super.beforeCreate(data);

    if (!payload.slug) {
      payload.slug = slugify(payload.name);
    }

    const existing = await this.productCategoryRepository.findBySlug(payload.slug);
    if (existing) {
      payload.slug = `${payload.slug}-${Date.now()}`;
    }

    if (payload.parent_id) {
      payload.parent_id = BigInt(payload.parent_id);
    }

    return payload;
  }

  override async getOne(id: string | number | bigint): Promise<ProductCategory> {
    const entity = await super.getOne(id);
    verifyGroupOwnership(entity as any);
    return entity;
  }

  protected override async beforeUpdate(id: string | number | bigint, data: UpdateProductCategoryDto): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Product Category with ID ${id} not found`);
    }

    // Kiểm tra quyền sở hữu
    verifyGroupOwnership(entity as any);

    const payload: any = { ...data };
    if (payload.name && !payload.slug) {
      payload.slug = slugify(payload.name);
    }

    if (payload.slug && payload.slug !== entity.slug) {
      const existing = await this.productCategoryRepository.findBySlug(payload.slug);
      if (existing && existing.id !== entity.id) {
        payload.slug = `${payload.slug}-${Date.now()}`;
      }
    }

    if (payload.parent_id) {
      payload.parent_id = BigInt(payload.parent_id);
    }

    return payload;
  }

  protected override async beforeDelete(id: string | number | bigint): Promise<boolean> {
    const entity = await this.repository.findById(id);
    if (entity) {
      verifyGroupOwnership(entity as any);
    }
    return true;
  }
}

