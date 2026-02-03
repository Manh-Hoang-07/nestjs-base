import { Injectable, Inject } from '@nestjs/common';
import { BaseService } from '@/common/core/services/base.service';
import { ComicCategory } from '@prisma/client';
import { IComicCategoryRepository, COMIC_CATEGORY_REPOSITORY } from '../../domain/comic-category.repository';

@Injectable()
export class PublicComicCategoriesService extends BaseService<ComicCategory, IComicCategoryRepository> {
  constructor(
    @Inject(COMIC_CATEGORY_REPOSITORY) protected readonly repository: IComicCategoryRepository,
  ) {
    super(repository);
  }

  protected override async prepareFilters(filters?: any) {
    return filters || {};
  }

  protected override async prepareOptions(options: any = {}) {
    const base = await super.prepareOptions(options);
    return {
      ...base,
      select: options.select || {
        id: true,
        name: true,
        slug: true,
      },
    };
  }
}



