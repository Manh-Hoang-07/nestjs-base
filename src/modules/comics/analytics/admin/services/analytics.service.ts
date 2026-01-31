import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Dashboard analytics
   */
  async getDashboard() {
    const [totalComics, totalViewsResult, totalFollowsResult, topComics] = await Promise.all([
      this.prisma.comic.count(),
      this.prisma.$queryRaw<Array<{ total: bigint }>>`
        SELECT SUM(view_count) as total FROM comic_stats
      `,
      this.prisma.$queryRaw<Array<{ total: bigint }>>`
        SELECT SUM(follow_count) as total FROM comic_stats
      `,
      this.prisma.comicStats.findMany({
        orderBy: { view_count: 'desc' },
        take: 10,
        include: { comic: true },
      }),
    ]);

    return {
      total_comics: totalComics,
      total_views: Number(totalViewsResult[0]?.total || 0),
      total_follows: Number(totalFollowsResult[0]?.total || 0),
      top_comics: topComics.map(s => ({
        comic: s.comic,
        stats: s,
      })),
    };
  }

  /**
   * Top comics
   */
  async getTopComics(limit: number = 20, sortBy: 'views' | 'follows' | 'rating' = 'views') {
    const orderBy: Prisma.ComicStatsOrderByWithRelationInput = sortBy === 'views' 
      ? { view_count: 'desc' }
      : sortBy === 'follows'
      ? { follow_count: 'desc' }
      : { rating_sum: 'desc' };

    const stats = await this.prisma.comicStats.findMany({
      orderBy,
      take: limit,
      include: { comic: true },
    });

    return stats.map(s => ({
      comic: s.comic,
      stats: s,
    }));
  }

  /**
   * Views over time
   */
  async getViewsOverTime(startDate: Date, endDate: Date) {
    const views = await this.prisma.comicView.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { created_at: 'asc' },
    });

    // Group by date
    const grouped = views.reduce((acc, view) => {
      const date = view.created_at.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([date, count]) => ({
      date,
      count,
    }));
  }
}

