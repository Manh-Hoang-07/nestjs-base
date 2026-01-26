import { Injectable, Inject } from '@nestjs/common';
import { PostCategory } from '@prisma/client';
import { IPostCategoryRepository, POST_CATEGORY_REPOSITORY, PostCategoryFilter } from '@/modules/post/post-category/domain/post-category.repository';
import { BaseContentService } from '@/common/core/services';

@Injectable()
export class PostCategoryService extends BaseContentService<PostCategory, IPostCategoryRepository> {
  constructor(
    @Inject(POST_CATEGORY_REPOSITORY)
    private readonly categoryRepo: IPostCategoryRepository,
  ) {
    super(categoryRepo);
  }


  async getSimpleList(query: any) {
    return this.getList({
      ...query,
      limit: 1000,
      sort: query.sort ?? 'sort_order:ASC'
    });
  }

  protected async beforeCreate(data: any) {
    const payload = { ...data };
    await this.ensureSlug(payload);
    payload.parent_id = this.toBigInt(payload.parent_id);
    return payload;
  }

  protected async beforeUpdate(id: number | bigint, data: any) {
    const payload = { ...data };
    const current = await this.categoryRepo.findById(id);
    await this.ensureSlug(payload, id, current?.slug);
    payload.parent_id = this.toBigInt(payload.parent_id);
    return payload;
  }

  protected transform(category: any) {
    if (!category) return category;
    const item = super.transform(category) as any;
    if (item.parent) {
      const { id, name, slug } = item.parent;
      item.parent = { id, name, slug };
    }
    if (Array.isArray(item.children)) {
      item.children = item.children.map((child: any) => {
        const { id, name, slug } = child;
        return { id, name, slug };
      });
    }
    return item;
  }

  private toBigInt(value?: number | string | bigint | null): bigint | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'bigint') return value;
    const num = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(num)) return null;
    return BigInt(num);
  }
}

