import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BaseService } from '@/common/core/services/base.service';
import { Chapter } from '@prisma/client';
import { IChapterRepository, CHAPTER_REPOSITORY } from '../../domain/chapter.repository';
import { PUBLIC_CHAPTER_STATUSES } from '@/shared/enums';
import { IChapterPageRepository, CHAPTER_PAGE_REPOSITORY } from '../../domain/chapter-page.repository';

@Injectable()
export class PublicChaptersService extends BaseService<Chapter, IChapterRepository> {
  constructor(
    @Inject(CHAPTER_REPOSITORY) protected readonly repository: IChapterRepository,
    @Inject(CHAPTER_PAGE_REPOSITORY) private readonly pageRepository: IChapterPageRepository,
  ) {
    super(repository);
  }

  protected override async prepareFilters(filters?: any) {
    const prepared: any = { ...(filters || {}) };

    if (!prepared.status) {
      prepared.status = { in: PUBLIC_CHAPTER_STATUSES };
    }

    return prepared;
  }

  protected override async prepareOptions(options: any = {}) {
    const base = await super.prepareOptions(options);

    const publicSelect = {
      id: true,
      comic_id: true,
      title: true,
      chapter_index: true,
      chapter_label: true,
      status: true,
      view_count: true,
      created_at: true,
      updated_at: true,
      comic: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      pages: {
        orderBy: { page_number: 'asc' as const },
        select: {
          id: true,
          page_number: true,
          image_url: true,
          width: true,
          height: true,
          file_size: true,
        }
      },
    };

    return {
      ...base,
      select: options?.select ?? publicSelect,
    };
  }

  protected override transform(entity: any): any {
    return this.deepConvertBigInt(entity);
  }

  /**
   * Lấy danh sách pages của chapter
   */
  async getPages(chapterId: number) {
    const chapter = await this.repository.findOne({
      id: chapterId,
      status: { in: PUBLIC_CHAPTER_STATUSES }
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    const pages = await this.pageRepository.findMany({
      chapter_id: chapterId,
    }, {
      sort: 'page_number:ASC'
    });

    return this.deepConvertBigInt(pages);
  }

  /**
   * Lấy chapter tiếp theo
   */
  async getNext(chapterId: number) {
    const chapter = await this.repository.findById(chapterId);
    if (!chapter) throw new NotFoundException('Chapter not found');

    const next = await (this.repository as any).delegate.findFirst({
      where: {
        comic_id: chapter.comic_id,
        chapter_index: { gt: chapter.chapter_index },
        status: { in: PUBLIC_CHAPTER_STATUSES as any },
      },
      orderBy: { chapter_index: 'asc' },
    });

    return next ? this.transform(next) : null;
  }

  /**
   * Lấy chapter trước đó
   */
  async getPrev(chapterId: number) {
    const chapter = await this.repository.findById(chapterId);
    if (!chapter) throw new NotFoundException('Chapter not found');

    const prev = await (this.repository as any).delegate.findFirst({
      where: {
        comic_id: chapter.comic_id,
        chapter_index: { lt: chapter.chapter_index },
        status: { in: PUBLIC_CHAPTER_STATUSES as any },
      },
      orderBy: { chapter_index: 'desc' },
    });

    return prev ? this.transform(prev) : null;
  }
}


