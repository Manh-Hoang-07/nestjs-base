import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { createPaginationMeta } from '@/common/base/utils/pagination.helper';
import { toPlain } from '@/common/base/services/prisma/prisma.utils';

@Injectable()
export class PublicCommentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy comments của comic (tree structure)
   */
  async getByComic(comicId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const whereTop = {
      comic_id: BigInt(comicId),
      chapter_id: null,
      parent_id: null,
      status: 'visible' as const,
    };

    const [topLevelComments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: whereTop,
        include: {
          user: true,
          replies: {
            where: { status: 'visible' },
            include: { user: true },
            orderBy: { created_at: 'asc' },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where: whereTop }),
    ]);

    return {
      data: toPlain(topLevelComments),
      meta: createPaginationMeta(page, limit, total),
    };
  }

  /**
   * Lấy comments của chapter (tree structure)
   */
  async getByChapter(chapterId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const whereTop = {
      chapter_id: BigInt(chapterId),
      parent_id: null,
      status: 'visible' as const,
    };

    const [topLevelComments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: whereTop,
        include: {
          user: true,
          replies: {
            where: { status: 'visible' },
            include: { user: true },
            orderBy: { created_at: 'asc' },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where: whereTop }),
    ]);

    return {
      data: toPlain(topLevelComments),
      meta: createPaginationMeta(page, limit, total),
    };
  }
}
