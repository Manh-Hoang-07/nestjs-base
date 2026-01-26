import { Injectable, Inject } from '@nestjs/common';
import { PostTag } from '@prisma/client';
import { IPostTagRepository, POST_TAG_REPOSITORY, PostTagFilter } from '@/modules/post/post-tag/domain/post-tag.repository';
import { BaseService } from '@/common/core/services';

@Injectable()
export class PostTagService extends BaseService<PostTag, IPostTagRepository> {
  constructor(
    @Inject(POST_TAG_REPOSITORY)
    private readonly tagRepo: IPostTagRepository,
  ) {
    super(tagRepo);
  }

  async getList(query: any) {
    const filter: PostTagFilter = {
      status: 'active' as any,
    };
    if (query.search) filter.search = query.search;

    return super.getList({
      page: query.page,
      limit: query.limit,
      sort: query.sort || 'created_at:DESC',
      filter,
    });
  }

  async findBySlug(slug: string) {
    const tag = await this.tagRepo.findBySlug(slug);
    if (!tag || (tag as any).status !== 'active') return null;
    return this.transform(tag);
  }
}

