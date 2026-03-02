import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ComicCategory } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IComicCategoryRepository, COMIC_CATEGORY_REPOSITORY } from '../../domain/comic-category.repository';
import { StringUtil } from '@/core/utils/string.util';
import { verifyGroupOwnership, getGroupFilter } from '@/common/shared/utils/group-ownership.util';

@Injectable()
export class ComicCategoryService extends BaseService<ComicCategory, IComicCategoryRepository> {
  constructor(
    @Inject(COMIC_CATEGORY_REPOSITORY)
    protected readonly comicCategoryRepository: IComicCategoryRepository,
  ) {
    super(comicCategoryRepository);
    // Bật tự động thêm group_id khi tạo mới
    this.autoAddGroupId = true;
  }

  /**
   * Chuẩn bị filters theo group/context
   */
  protected override async prepareFilters(filters?: any): Promise<any> {
    const prepared = { ...(filters || {}) };
    if (prepared.group_id === undefined) {
      Object.assign(prepared, getGroupFilter());
    }
    return prepared;
  }

  protected override async beforeCreate(data: any): Promise<any> {
    // Gọi base beforeCreate để tự động thêm group_id
    const payload = await super.beforeCreate(data);

    if (!payload.slug) {
      payload.slug = StringUtil.toSlug(payload.name);
    }

    return payload;
  }

  override async getOne(id: string | number | bigint): Promise<ComicCategory> {
    const entity = await super.getOne(id);
    verifyGroupOwnership(entity as any);
    return entity;
  }

  protected override async beforeUpdate(id: string | number | bigint, data: any): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Kiểm tra quyền sở hữu
    verifyGroupOwnership(entity as any);
    const payload = { ...data };
    if (payload.name && !payload.slug) {
      payload.slug = StringUtil.toSlug(payload.name);
    }
    return payload;
  }

  protected override async beforeDelete(id: string | number | bigint): Promise<boolean> {
    const entity = await this.repository.findById(id);
    if (entity) {
      verifyGroupOwnership(entity as any);
    }
    return true;
  }
}


