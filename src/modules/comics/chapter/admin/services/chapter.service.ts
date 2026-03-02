import { BadRequestException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Chapter } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IChapterRepository, CHAPTER_REPOSITORY } from '../../domain/chapter.repository';
import { ComicNotificationService } from '@/modules/comics/shared/services/comic-notification.service';
import { ChapterStatus } from '@/shared/enums';
import { IChapterPageRepository, CHAPTER_PAGE_REPOSITORY } from '../../domain/chapter-page.repository';
import { IComicRepository, COMIC_REPOSITORY } from '../../../comic/domain/comic.repository';
import { verifyGroupOwnership, getGroupFilter } from '@/common/shared/utils/group-ownership.util';

const PUBLIC_CHAPTER_STATUSES = [ChapterStatus.published];

@Injectable()
export class ChapterService extends BaseService<Chapter, IChapterRepository> {
  constructor(
    @Inject(CHAPTER_REPOSITORY)
    protected readonly chapterRepository: IChapterRepository,
    @Inject(CHAPTER_PAGE_REPOSITORY)
    private readonly pageRepository: IChapterPageRepository,
    @Inject(COMIC_REPOSITORY)
    private readonly comicRepository: IComicRepository,
    private readonly notificationService: ComicNotificationService,
  ) {
    super(chapterRepository);
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

    // Validate chapter_index unique
    if (payload.comic_id && payload.chapter_index !== undefined) {
      const existing = await this.chapterRepository.findByComicIdAndIndex(
        payload.comic_id,
        payload.chapter_index
      );
      if (existing) {
        throw new BadRequestException(`Chapter với index ${payload.chapter_index} đã tồn tại trong comic này`);
      }
    }

    // Tách pages để xử lý trong afterCreate
    if (payload.pages !== undefined) {
      delete payload.pages;
    }

    return payload;
  }

  protected override async afterCreate(entity: Chapter, data: any): Promise<void> {
    // Create pages if provided
    if (data.pages && Array.isArray(data.pages) && data.pages.length > 0) {
      await this.pageRepository.createMany(data.pages.map((page: any, index: number) => ({
        chapter_id: entity.id,
        page_number: index + 1,
        image_url: page.image_url,
        width: page.width,
        height: page.height,
        file_size: page.file_size ? BigInt(page.file_size) : null,
      })));
    }

    // Notify followers if published
    if (entity.status === ChapterStatus.published) {
      await this.notificationService.notifyNewChapter(entity);
      await this.updateComicLastChapter(entity.comic_id);
    }
  }

  override async getOne(id: string | number | bigint): Promise<Chapter> {
    const entity = await super.getOne(id);
    verifyGroupOwnership(entity as any);
    return entity;
  }

  protected override async beforeUpdate(id: string | number | bigint, data: any): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    // Kiểm tra quyền sở hữu
    verifyGroupOwnership(entity as any);

    const payload = { ...data };

    // Validate chapter_index unique if changed
    if (payload.chapter_index !== undefined && payload.chapter_index !== entity.chapter_index) {
      const duplicate = await this.chapterRepository.findByComicIdAndIndex(
        entity.comic_id,
        payload.chapter_index
      );
      if (duplicate && duplicate.id !== entity.id) {
        throw new BadRequestException(`Chapter với index ${payload.chapter_index} đã tồn tại trong comic này`);
      }
    }

    return payload;
  }

  protected override async afterUpdate(entity: Chapter, data: any): Promise<void> {
    // Notify if status changed to published
    if (data.status === ChapterStatus.published) {
      await this.notificationService.notifyNewChapter(entity);
    }

    // Update comic's last chapter info if relevant changes
    if (data.status === ChapterStatus.published || data.chapter_index !== undefined) {
      await this.updateComicLastChapter(entity.comic_id);
    }
  }

  protected override async afterDelete(id: string | number | bigint): Promise<void> {
    const entity = await this.repository.findById(id);
    if (entity && entity.comic_id) {
      await this.updateComicLastChapter(entity.comic_id as bigint);
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
   * Helper: Update comic's last chapter info
   */
  private async updateComicLastChapter(comicId: bigint): Promise<void> {
    const lastChapter = await (this.chapterRepository as any).delegate.findFirst({
      where: {
        comic_id: comicId,
        status: { in: PUBLIC_CHAPTER_STATUSES as any },
      },
      orderBy: { chapter_index: 'desc' },
      select: {
        id: true,
        created_at: true,
      },
    });

    await this.comicRepository.update(comicId, {
      last_chapter_id: lastChapter?.id || null,
      last_chapter_updated_at: lastChapter?.created_at || null,
    } as any);
  }

  /**
   * Update pages
   */
  async updatePages(chapterId: string | number | bigint, pages: any[]) {
    await this.getOne(chapterId); // Check exists

    await this.pageRepository.deleteMany({ chapter_id: chapterId });

    if (pages && pages.length > 0) {
      await this.pageRepository.createMany(pages.map((page, index) => ({
        chapter_id: BigInt(chapterId),
        page_number: index + 1,
        image_url: page.image_url,
        width: page.width,
        height: page.height,
        file_size: page.file_size ? BigInt(page.file_size) : null,
      })));
    }

    return this.getOne(chapterId);
  }

  protected override transform(entity: any): any {
    return this.deepConvertBigInt(entity);
  }
}


