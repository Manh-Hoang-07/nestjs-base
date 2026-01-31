import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaListService, PrismaListBag } from '@/common/base/services/prisma/prisma-list.service';
import { toPlain } from '@/common/base/services/prisma/prisma.utils';
import { PUBLIC_CHAPTER_STATUSES } from '@/shared/enums';

type ChapterBag = PrismaListBag & {
  Model: any;
  Where: any;
  Select: any;
  Include: any;
  OrderBy: any;
};

@Injectable()
export class PublicChaptersService extends PrismaListService<ChapterBag> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.chapter, ['id', 'created_at', 'chapter_index', 'view_count'], 'created_at:DESC');
  }

  /**
   * Override để chỉ lấy chapters có status public
   */
  protected override prepareFilters(filters?: any, _options?: any): boolean | any {
    const prepared = { ...(filters || {}) };
    prepared.status = { in: PUBLIC_CHAPTER_STATUSES };
    return prepared;
  }

  /**
   * Override để load relations
   * Ưu tiên: select > include mặc định
   */
  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    
    // Nếu có select trong queryOptions, dùng select và bỏ include
    if (queryOptions?.select) {
      return {
        ...base,
        select: queryOptions.select,
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
      where: { id: BigInt(chapterId), status: PUBLIC_CHAPTER_STATUSES[0] as any },
      select: { id: true },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    const pages = await this.prisma.chapterPage.findMany({
      where: { chapter_id: BigInt(chapterId) },
      orderBy: { page_number: 'asc' },
    });

    return toPlain(pages);
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
        chapter_index: chapter.chapter_index + 1,
        status: PUBLIC_CHAPTER_STATUSES[0] as any,
      },
      orderBy: { id: 'asc' },
    });

    return next ? toPlain(next) : null;
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
        chapter_index: chapter.chapter_index - 1,
        status: PUBLIC_CHAPTER_STATUSES[0] as any,
      },
      orderBy: { id: 'desc' },
    });

    return prev ? toPlain(prev) : null;
  }
}

