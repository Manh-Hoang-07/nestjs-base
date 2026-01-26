import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Post } from '@prisma/client';
import { RequestContext } from '@/common/shared/utils';
import { verifyGroupOwnership } from '@/common/shared/utils';
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


  private _temp_tagIds: number[] | null = null;
  private _temp_categoryIds: number[] | null = null;

  async getSimpleList(query: any) {
    return this.getList({
      page: 1,
      limit: 1000,
      search: query.search
    } as any);
  }

  protected async beforeCreate(data: any) {
    const payload = { ...data };
    await this.ensureSlug(payload);

    payload.primary_postcategory_id = this.toBigInt(payload.primary_postcategory_id);
    payload.group_id = payload.group_id !== undefined ? this.toBigInt(payload.group_id) : this.resolveGroupId();
    payload.published_at = this.normalizeDate(payload.published_at);

    // Temp store relations, handled in afterCreate
    this._temp_tagIds = this.normalizeIdArray(payload.tag_ids);
    this._temp_categoryIds = this.normalizeIdArray(payload.category_ids);
    delete payload.tag_ids;
    delete payload.category_ids;

    return payload;
  }

  protected async afterCreate(post: Post, data: any) {
    const tagIds = this._temp_tagIds;
    const categoryIds = this._temp_categoryIds;
    if (tagIds || categoryIds) {
      await this.postRepo.syncRelations(post.id, tagIds || [], categoryIds || []);
    }
  }

  protected async beforeUpdate(id: number, data: any) {
    const current = await this.postRepo.findById(id);
    if (!current) throw new BadRequestException('Post not found');

    verifyGroupOwnership({ group_id: (current as any).group_id ? Number((current as any).group_id) : null });

    const payload = { ...data };
    await this.ensureSlug(payload, id, (current as any).slug);

    payload.primary_postcategory_id = this.toBigInt(payload.primary_postcategory_id);
    payload.published_at = this.normalizeDate(payload.published_at);

    // Temp store relations
    this._temp_tagIds = this.normalizeIdArray(payload.tag_ids);
    this._temp_categoryIds = this.normalizeIdArray(payload.category_ids);
    delete payload.tag_ids;
    delete payload.category_ids;

    return payload;
  }

  protected async afterUpdate(post: Post, data: any) {
    const tagIds = this._temp_tagIds;
    const categoryIds = this._temp_categoryIds;
    if (tagIds || categoryIds) {
      await this.postRepo.syncRelations(post.id, tagIds || undefined, categoryIds || undefined);
    }
  }

  async delete(id: number): Promise<boolean> {
    const current = await this.postRepo.findById(id);
    if (!current) return false;

    verifyGroupOwnership({ group_id: (current as any).group_id ? Number((current as any).group_id) : null });

    // Soft delete via update
    await this.update(id, { deleted_at: new Date() });
    return true;
  }

  async getViewStats(postId: number, startDate: string, endDate: string) {
    return this.postRepo.getViewStats(postId, new Date(startDate), new Date(endDate));
  }

  async getStatisticsOverview() {
    return this.postRepo.getStatisticsOverview();
  }

  // Helpers
  private normalizeDate(input: any): Date | null | undefined {
    if (input === null) return null;
    if (input === undefined) return undefined;
    if (input instanceof Date) return input;
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  private normalizeIdArray(input: any): number[] | null {
    if (input === undefined) return null;
    if (!Array.isArray(input)) return [];
    return input.map((id: any) => Number(id)).filter((id) => !Number.isNaN(id));
  }

  private toBigInt(value?: number | string | bigint | null): bigint | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'bigint') return value;
    const num = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(num)) return null;
    return BigInt(num);
  }

  private resolveGroupId(): bigint | null {
    const groupId = RequestContext.get<number | null>('groupId');
    return groupId ? this.toBigInt(groupId) : null;
  }

  protected transform(post: any) {
    if (!post) return post;
    const p = super.transform(post) as any;

    if (p.primary_category) {
      const { id, name, slug } = p.primary_category;
      p.primary_category = { id, name, slug };
    }
    if (p.categories) {
      p.categories = (p.categories as any[])
        .map((link) => link?.category)
        .filter(Boolean)
        .map((cat: any) => ({ id: cat.id, name: cat.name, slug: cat.slug }));
    }
    if (p.tags) {
      p.tags = (p.tags as any[])
        .map((link) => link?.tag)
        .filter(Boolean)
        .map((tag: any) => ({ id: tag.id, name: tag.name, slug: tag.slug }));
    }
    return p;
  }
}
