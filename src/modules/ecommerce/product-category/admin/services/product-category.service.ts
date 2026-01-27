import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ProductCategory } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IProductCategoryRepository, PRODUCT_CATEGORY_REPOSITORY } from '../../domain/product-category.repository';
import { CreateProductCategoryDto } from '../dtos/create-product-category.dto';
import { UpdateProductCategoryDto } from '../dtos/update-product-category.dto';
import { slugify } from '@/common/shared/utils/string.util';

@Injectable()
export class AdminProductCategoryService extends BaseService<ProductCategory, IProductCategoryRepository> {
  constructor(
    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    protected readonly productCategoryRepository: IProductCategoryRepository,
  ) {
    super(productCategoryRepository);
  }

  async getSimpleList(query: any) {
    return this.getList({ ...query, limit: 1000 });
  }

  async findTree() {
    return this.productCategoryRepository.getTree();
  }

  async findRootCategories() {
    return this.productCategoryRepository.findMany({ parent_id: null });
  }

  async findChildren(parentId: number | bigint) {
    return this.productCategoryRepository.findMany({ parent_id: parentId });
  }

  async restore(id: number | bigint) {
    return this.productCategoryRepository.update(id, { deleted_at: null } as any);
  }

  protected override async beforeCreate(data: CreateProductCategoryDto): Promise<any> {
    const payload: any = { ...data };
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

  protected override async beforeUpdate(id: string | number | bigint, data: UpdateProductCategoryDto): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Product Category with ID ${id} not found`);
    }

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
}