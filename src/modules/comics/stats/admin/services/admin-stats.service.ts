import { Injectable, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IComicRepository, COMIC_REPOSITORY } from '../../../comic/domain/comic.repository';
import { IComicStatsRepository, COMIC_STATS_REPOSITORY } from '../../domain/comic-stats.repository';
import { IComicViewRepository, COMIC_VIEW_REPOSITORY } from '../../domain/comic-view.repository';
import { RequestContext } from '@/common/shared/utils';
import { getGroupFilter } from '@/common/shared/utils/group-ownership.util';


@Injectable()
export class AdminStatsService {
  constructor(
    @Inject(COMIC_REPOSITORY)
    private readonly comicRepository: IComicRepository,
    @Inject(COMIC_STATS_REPOSITORY)
    private readonly statsRepository: IComicStatsRepository,
    @Inject(COMIC_VIEW_REPOSITORY)
    private readonly viewRepository: IComicViewRepository,
  ) { }

  /**
   * Dashboard analytics
   */
  async getDashboard() {
    const filter = getGroupFilter();

    const [totalComics, totalViews, totalFollows, topComics] = await Promise.all([
      this.comicRepository.count(filter as any),
      this.statsRepository.sum('view_count', filter),
      this.statsRepository.sum('follow_count', filter),
      this.statsRepository.findMany(filter, {
        sort: 'view_count:DESC',
        limit: 10,
        include: { comic: true }
      } as any),
    ]);

    return {
      total_comics: totalComics,
      total_views: totalViews,
      total_follows: totalFollows,
      top_comics: topComics.map(s => ({
        comic: (s as any).comic,
        stats: s,
      })),
    };
  }


  /**
   * Top comics
   */
  async getTopComics(limit: number = 20, sortBy: 'views' | 'follows' | 'rating' = 'views') {
    const filter = getGroupFilter();

    const sort = sortBy === 'views'
      ? 'view_count:DESC'
      : sortBy === 'follows'
        ? 'follow_count:DESC'
        : 'rating_sum:DESC';

    const stats = await this.statsRepository.findMany(filter, {
      sort,
      take: limit,
      include: { comic: true },
    } as any);

    return stats.map(s => ({
      comic: (s as any).comic,
      stats: s,
    }));
  }


  /**
   * Views over time
   */
  async getViewsOverTime(startDate: Date, endDate: Date) {
    const filter = getGroupFilter();
    const views = await this.viewRepository.findMany({
      ...filter,
      date_from: startDate,
      date_to: endDate,
    }, {
      sort: 'created_at:ASC'
    });


    // Group by date
    const grouped = views.reduce((acc: Record<string, number>, view) => {
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


