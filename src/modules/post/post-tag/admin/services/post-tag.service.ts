import { Injectable, Inject } from '@nestjs/common';
import { PostTag } from '@prisma/client';
import { IPostTagRepository, POST_TAG_REPOSITORY, PostTagFilter } from '@/modules/post/post-tag/domain/post-tag.repository';
import { BaseContentService } from '@/common/core/services';

@Injectable()
export class PostTagService extends BaseContentService<PostTag, IPostTagRepository> {
  constructor(
    @Inject(POST_TAG_REPOSITORY)
    private readonly tagRepo: IPostTagRepository,
  ) {
    super(tagRepo);
  }


  async getSimpleList(query: any) {
    return this.getList({ ...query, limit: 1000 });
  }

  protected async beforeCreate(data: any) {
    const payload = { ...data };
    await this.ensureSlug(payload);
    return payload;
  }

  protected async beforeUpdate(id: number | bigint, data: any) {
    const payload = { ...data };
    const current = await this.tagRepo.findById(id);
    await this.ensureSlug(payload, id, current?.slug);
    return payload;
  }
}

