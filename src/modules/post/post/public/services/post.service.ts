import { Inject, Injectable } from '@nestjs/common';
import { Post } from '@prisma/client';
import { IPostRepository, POST_REPOSITORY, PostFilter } from '@/modules/post/post/domain/post.repository';
import { GetPostsDto } from '../dtos/get-posts.dto';
import { BaseContentService } from '@/common/core/services';

@Injectable()
export class PostService extends BaseContentService<Post, IPostRepository> {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepo: IPostRepository,
  ) {
    super(postRepo);
  }

  protected async prepareFilters(filter: any) {
    // Public API chỉ hiển thị published, normalize snake_case/camelCase
    const normalized = { ...filter };

    // Normalize categorySlug
    if (filter.category_slug) {
      normalized.categorySlug = filter.category_slug;
      delete normalized.category_slug;
    }

    // Normalize tagSlug
    if (filter.tag_slug) {
      normalized.tagSlug = filter.tag_slug;
      delete normalized.tag_slug;
    }

    // Normalize isFeatured
    if (filter.is_featured !== undefined) {
      normalized.isFeatured = filter.is_featured;
      delete normalized.is_featured;
    }

    // Normalize isPinned
    if (filter.is_pinned !== undefined) {
      normalized.isPinned = filter.is_pinned;
      delete normalized.is_pinned;
    }

    return { ...normalized, status: 'published' };
  }



  async getOneBySlug(slug: string) {
    const post = await this.postRepo.findPublishedBySlug(slug);
    return this.transform(post);
  }

  // Keep original name for compatibility if needed, though getOneBySlug is clearer
  async getOne(slug: string) {
    return this.getOneBySlug(slug);
  }

  // No need to override incrementViewCount as BaseContentService now handles it automatically
  // by delegating to the specialized repository method if it exists.

  protected transform(post: any) {
    if (!post) return post;

    const p = super.transform(post) as any;

    // Logic adapted from previous implementation
    if (p.primary_category) {
      const primary = p.primary_category as any;
      if (primary.status && primary.status !== 'active') {
        p.primary_category = null;
      } else {
        const { id, name, slug, description } = primary;
        p.primary_category = { id, name, slug, description };
      }
    }

    if (Array.isArray(p.categories)) {
      p.categories = (p.categories as any[])
        .map((link) => link?.category)
        .filter(Boolean)
        .filter(cat => cat.status === 'active') // Ensure only active categories
        .map((cat: any) => {
          const { id, name, slug, description } = cat;
          return { id, name, slug, description };
        });
    }

    if (Array.isArray(p.tags)) {
      p.tags = (p.tags as any[])
        .map((link) => link?.tag)
        .filter(Boolean)
        .map((tag: any) => {
          const { id, name, slug, description } = tag;
          return { id, name, slug, description };
        });
    }
    return p;
  }
}

