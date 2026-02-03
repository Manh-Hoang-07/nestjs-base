import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IComicRepository, COMIC_REPOSITORY } from '../../../comic/domain/comic.repository';
import { IComicStatsRepository, COMIC_STATS_REPOSITORY } from '../../domain/comic-stats.repository';

@Injectable()
export class StatsService {
  constructor(
    @Inject(COMIC_REPOSITORY)
    private readonly comicRepository: IComicRepository,
    @Inject(COMIC_STATS_REPOSITORY)
    private readonly statsRepository: IComicStatsRepository,
  ) { }

  /**
   * Lấy stats của comic
   */
  async getComicStats(comicId: number) {
    const comic = await this.comicRepository.findById(comicId);
    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    const stats = await this.statsRepository.findById(comicId);

    return {
      comic_id: comicId,
      view_count: Number(stats?.view_count || 0n),
      follow_count: Number(stats?.follow_count || 0n),
      rating_count: Number(stats?.rating_count || 0n),
      rating_average: stats && Number(stats.rating_count || 0n) > 0
        ? (Number(stats.rating_sum || 0n) / Number(stats.rating_count)).toFixed(2)
        : '0',
    };
  }
}
