import { Injectable, Inject } from '@nestjs/common';
import { IAboutRepository, ABOUT_REPOSITORY, AboutFilter } from '@/modules/introduction/about/domain/about.repository';
import { BaseContentService } from '@/common/core/services';

@Injectable()
export class AboutService extends BaseContentService<any, IAboutRepository> {
  constructor(
    @Inject(ABOUT_REPOSITORY)
    private readonly aboutRepo: IAboutRepository,
  ) {
    super(aboutRepo);
  }

  protected defaultSort = 'sort_order:asc,created_at:desc';

  async getList(query: any) {
    const filter: AboutFilter = {};
    if (query.search) filter.search = query.search;
    if (query.section_type) filter.section_type = query.section_type;
    if (query.status) filter.status = query.status;

    return super.getList({
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      filter,
    });
  }

  protected async beforeCreate(data: any) {
    await this.ensureSlug(data, undefined, undefined, 'slug', 'title');
    return data;
  }

  protected async beforeUpdate(id: number | bigint, data: any) {
    const current = await this.aboutRepo.findById(id);
    await this.ensureSlug(data, id, current?.slug, 'slug', 'title');
    return data;
  }
}

