import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BaseService } from '@/common/core/services/base.service';
import { Chapter } from '@prisma/client';
import { IChapterRepository, CHAPTER_REPOSITORY } from '../../domain/chapter.repository';
import { PUBLIC_CHAPTER_STATUSES } from '@/shared/enums';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class PublicChaptersService extends BaseService<Chapter, IChapterRepository> {
  constructor(
    @Inject(CHAPTER_REPOSITORY) protected readonly repository: IChapterRepository,
    private readonly prisma: PrismaService,
  ) {
    super(repository);
  }

  /**
   * Override để chỉ lấy chapters có status public
   */
  protected override async prepareFilters(filters?: any) {
    return {
      ...(filters || {}),
      status: { in: PUBLIC_CHAPTER_STATUSES }
    };
  }

  /**
   * Override để load relations
   * Ưu tiên: select > include mặc định
   */
  protected override async prepareOptions(options: any = {}) {
    const base = await super.prepareOptions(options);

    // Nếu có select trong options, trả về base (repo handle select)
    if (options?.select) {
      return {
        ...base,
        select: options.select,
        include: undefined,
      };
    }

    // Nếu không có select, dùng include mặc định
    return {
      ...base,
      include: {
        comic: true,
        pages: {
          orderBy: { page_number: 'asc' },
        },
      },
    };
  }

  /**
   * Lấy danh sách pages của chapter
   */
  async getPages(chapterId: number) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: BigInt(chapterId), status: { in: PUBLIC_CHAPTER_STATUSES } },
      select: { id: true },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    const pages = await this.prisma.chapterPage.findMany({
      where: { chapter_id: BigInt(chapterId) },
      orderBy: { page_number: 'asc' },
    });

    return this.deepConvertBigInt(pages);
  }

  /**
   * Lấy chapter tiếp theo
   */
  async getNext(chapterId: number) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: BigInt(chapterId) },
      select: { comic_id: true, chapter_index: true },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    const next = await this.prisma.chapter.findFirst({
      where: {
        comic_id: chapter.comic_id,
        chapter_index: { gt: chapter.chapter_index },
        status: { in: PUBLIC_CHAPTER_STATUSES },
        deleted_at: null,
      },
      orderBy: { chapter_index: 'asc' },
    });

    return next ? this.transform(next) : null;
  }

  /**
   * Lấy chapter trước đó
   */
  async getPrev(chapterId: number) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: BigInt(chapterId) },
      select: { comic_id: true, chapter_index: true },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    const prev = await this.prisma.chapter.findFirst({
      where: {
        comic_id: chapter.comic_id,
        chapter_index: { lt: chapter.chapter_index },
        status: { in: PUBLIC_CHAPTER_STATUSES },
        deleted_at: null,
      },
      orderBy: { chapter_index: 'desc' },
    });

    return prev ? this.transform(prev) : null;
  }
}

