import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { RequestContext } from '@/common/utils/request-context.util';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Lấy dashboard data cho user
   */
  async getDashboard(userId: number) {
    const [readingHistory, follows, bookmarks] = await Promise.all([
      this.prisma.readingHistory.findMany({
        where: { user_id: userId },
        include: {
          comic: true,
          chapter: true,
        },
        orderBy: { updated_at: 'desc' },
        take: 10,
      }),
      this.prisma.comicFollow.findMany({
        where: { user_id: userId },
        include: { comic: true },
        orderBy: { created_at: 'desc' },
        take: 10,
      }),
      this.prisma.bookmark.findMany({
        where: { user_id: userId },
        include: {
          chapter: {
            include: {
              comic: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: 10,
      }),
    ]);

    const [readingCount, followCount, bookmarkCount] = await Promise.all([
      this.prisma.readingHistory.count({ where: { user_id: userId } }),
      this.prisma.comicFollow.count({ where: { user_id: userId } }),
      this.prisma.bookmark.count({ where: { user_id: userId } }),
    ]);

    return {
      reading_history: readingHistory,
      follows: follows,
      bookmarks: bookmarks,
      stats: {
        reading_count: readingCount,
        follow_count: followCount,
        bookmark_count: bookmarkCount,
      },
    };
  }

  /**
   * Lấy library (tất cả comics user đã đọc/follow)
   */
  async getLibrary(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Lấy từ reading history
    const [history, total] = await Promise.all([
      this.prisma.readingHistory.findMany({
        where: { user_id: userId },
        include: {
          comic: true,
          chapter: true,
        },
        orderBy: { updated_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.readingHistory.count({ where: { user_id: userId } }),
    ]);

    return {
      data: history.map(h => ({
        comic: h.comic,
        last_read_chapter: h.chapter,
        last_read_at: h.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}



