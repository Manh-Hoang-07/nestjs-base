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

  protected override async prepareFilters(filters?: any) {
    const prepared: any = { ...(filters || {}) };

    if (!prepared.status) {
      prepared.status = { in: PUBLIC_CHAPTER_STATUSES };
    }

    return prepared;
  }

  protected override async prepareOptions(options: any = {}) {
    const base = await super.prepareOptions(options);

    const defaultInclude = {
      comic: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      pages: {
        orderBy: { page_number: 'asc' },
      },
    };

    return {
      ...base,
      include: options?.include ?? defaultInclude,
      select: options?.select,
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
    const chapter = await this.repository.findById(chapterId);
    if (!chapter) throw new NotFoundException('Chapter not found');

    const next = await this.prisma.chapter.findFirst({
      where: {
        comic_id: chapter.comic_id,
        chapter_index: { gt: chapter.chapter_index },
        status: { in: PUBLIC_CHAPTER_STATUSES as any },
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
    const chapter = await this.repository.findById(chapterId);
    if (!chapter) throw new NotFoundException('Chapter not found');

    const prev = await this.prisma.chapter.findFirst({
      where: {
        comic_id: chapter.comic_id,
        chapter_index: { lt: chapter.chapter_index },
        status: { in: PUBLIC_CHAPTER_STATUSES as any },
        deleted_at: null,
      },
      orderBy: { chapter_index: 'desc' },
    });

    return prev ? this.transform(prev) : null;
  }
}

