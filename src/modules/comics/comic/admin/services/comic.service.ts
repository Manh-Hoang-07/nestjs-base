import { BadRequestException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Comic } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IComicRepository, COMIC_REPOSITORY } from '../../domain/comic.repository';
import { CreateComicDto } from '../dtos/create-comic.dto';
import { UpdateComicDto } from '../dtos/update-comic.dto';
import { StringUtil } from '@/core/utils/string.util';
import { IComicStatsRepository, COMIC_STATS_REPOSITORY } from '../../../stats/domain/comic-stats.repository';
import { verifyGroupOwnership, getGroupFilter } from '@/common/shared/utils/group-ownership.util';

@Injectable()
export class ComicService extends BaseService<Comic, IComicRepository> {
  constructor(
    @Inject(COMIC_REPOSITORY)
    protected readonly comicRepository: IComicRepository,
    @Inject(COMIC_STATS_REPOSITORY)
    private readonly statsRepository: IComicStatsRepository,
  ) {
    super(comicRepository);
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

  protected override async beforeCreate(data: CreateComicDto): Promise<any> {
    // Gọi base beforeCreate để tự động thêm group_id
    const payload = await super.beforeCreate(data);

    // Handle slug
    if (!payload.slug) {
      payload.slug = StringUtil.toSlug(payload.title);
    }

    // Check slug duplicate
    const existing = await this.comicRepository.findBySlug(payload.slug);
    if (existing) {
      payload.slug = `${payload.slug}-${Date.now()}`;
    }

    // Tách category_ids ra để xử lý trong afterCreate
    if ((payload as any).category_ids !== undefined) {
      delete (payload as any).category_ids;
    }

    return payload;
  }

  protected override async afterCreate(entity: Comic, data: CreateComicDto): Promise<void> {
    const comicId = entity.id;

    // Create ComicStats record via repository
    await this.statsRepository.create({
      comic_id: comicId,
      view_count: BigInt(0),
      follow_count: BigInt(0),
      rating_count: BigInt(0),
      rating_sum: BigInt(0),
    } as any);

    // Handle category_ids
    if (data.category_ids && data.category_ids.length > 0) {
      await this.comicRepository.syncCategories(comicId, data.category_ids.map(id => BigInt(id)));
    }
  }

  override async getOne(id: string | number | bigint): Promise<Comic> {
    const entity = await super.getOne(id);
    verifyGroupOwnership(entity as any);
    return entity;
  }

  protected override async beforeUpdate(id: string | number | bigint, data: UpdateComicDto): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Comic with ID ${id} not found`);
    }

    // Kiểm tra quyền sở hữu
    verifyGroupOwnership(entity as any);

    const payload = { ...data };

    // Handle slug
    if (payload.title && !payload.slug) {
      payload.slug = StringUtil.toSlug(payload.title);
    }

    if (payload.slug && payload.slug !== entity.slug) {
      const existing = await this.comicRepository.findBySlug(payload.slug);
      if (existing && existing.id !== entity.id) {
        payload.slug = `${payload.slug}-${Date.now()}`;
      }
    }

    // Tách category_ids ra để xử lý trong afterUpdate
    if ((payload as any).category_ids !== undefined) {
      delete (payload as any).category_ids;
    }

    return payload;
  }

  protected override async afterUpdate(entity: Comic, data: UpdateComicDto): Promise<void> {
    if (data.category_ids) {
      await this.comicRepository.syncCategories(entity.id, data.category_ids.map(id => BigInt(id)));
    }
  }

  protected override async beforeDelete(id: string | number | bigint): Promise<boolean> {
    const entity = await this.repository.findById(id);
    if (entity) {
      verifyGroupOwnership(entity as any);
    }
    return true;
  }

  /**
   * Transform to match system standards
   */
  protected override transform(entity: any): any {
    if (!entity) return null;

    const transformed: any = { ...entity };

    // Transform categories from nested structure to flat array
    if (transformed.categoryLinks && Array.isArray(transformed.categoryLinks)) {
      transformed.categories = transformed.categoryLinks
        .map((link: any) => link?.category)
        .filter(Boolean);

      transformed.category_ids = transformed.categories.map((cat: any) => cat.id);
      delete transformed.categoryLinks;
    } else if (!transformed.categories) {
      transformed.categories = [];
      transformed.category_ids = [];
    }

    return this.deepConvertBigInt(transformed);
  }
}


