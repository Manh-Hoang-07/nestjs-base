import { Injectable, Inject } from '@nestjs/common';
import { PostCategory } from '@prisma/client';
import { IPostCategoryRepository, POST_CATEGORY_REPOSITORY, PostCategoryFilter } from '@/modules/post/post-category/domain/post-category.repository';
import { BaseService } from '@/common/core/services';

@Injectable()
export class PostCategoryService extends BaseService<PostCategory, IPostCategoryRepository> {
  constructor(
    @Inject(POST_CATEGORY_REPOSITORY)
    private readonly categoryRepo: IPostCategoryRepository,
  ) {
    super(categoryRepo);
  }

  async getList(query: any) {
    const filter: PostCategoryFilter = {
      status: 'active' as any,
    };
    if (query.parentId !== undefined) filter.parentId = query.parentId;
    if (query.search) filter.search = query.search;

    return super.getList({
      page: query.page,
      limit: query.limit,
      sort: query.sort || 'sort_order:ASC',
      filter,
    });
  }

  async findBySlug(slug: string) {
    const category = await this.categoryRepo.findBySlug(slug);
    if (!category || (category as any).status !== 'active') return null;
    return this.transform(category);
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
}

