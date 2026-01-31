import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ComicCategory } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IComicCategoryRepository, COMIC_CATEGORY_REPOSITORY } from '../../domain/comic-category.repository';
import { StringUtil } from '@/core/utils/string.util';

@Injectable()
export class ComicCategoryService extends BaseService<ComicCategory, IComicCategoryRepository> {
  constructor(
    @Inject(COMIC_CATEGORY_REPOSITORY)
    protected readonly comicCategoryRepository: IComicCategoryRepository,
  ) {
    super(comicCategoryRepository);
  }

  protected override async beforeCreate(data: any): Promise<any> {
    const payload = { ...data };
    if (!payload.slug) {
      payload.slug = StringUtil.toSlug(payload.name);
    }
    return payload;
  }

  protected override async beforeUpdate(id: string | number | bigint, data: any): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    const payload = { ...data };
    if (payload.name && !payload.slug) {
      payload.slug = StringUtil.toSlug(payload.name);
    }
    return payload;
  }
}
