import { Injectable, Inject } from '@nestjs/common';
import { IComicViewRepository, COMIC_VIEW_REPOSITORY } from '../../stats/domain/comic-view.repository';
import { IComicStatsRepository, COMIC_STATS_REPOSITORY } from '../../stats/domain/comic-stats.repository';
import { IChapterRepository, CHAPTER_REPOSITORY } from '../../chapter/domain/chapter.repository';

@Injectable()
export class ViewTrackingService {
  constructor(
    @Inject(COMIC_VIEW_REPOSITORY)
    private readonly viewRepository: IComicViewRepository,
    @Inject(COMIC_STATS_REPOSITORY)
    private readonly statsRepository: IComicStatsRepository,
    @Inject(CHAPTER_REPOSITORY)
    private readonly chapterRepository: IChapterRepository,
  ) { }

  /**
   * Track view cho comic/chapter
   * Prevent duplicate views trong 1 giờ (IP + user_id)
   */
  async trackView(data: {
    comic_id: number;
    chapter_id?: number;
    user_id?: number;
    ip?: string;
    user_agent?: string;
  }) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Kiểm tra duplicate view
    const existingView = await this.viewRepository.findOne({
      comic_id: data.comic_id,
      chapter_id: data.chapter_id || null,
      user_id: data.user_id || null,
      ip: data.ip || null,
      date_from: oneHourAgo,
    });

    if (existingView) {
      return { tracked: false, reason: 'duplicate' };
    }

    // Tạo view record
    await this.viewRepository.create({
      comic_id: BigInt(data.comic_id),
      chapter_id: data.chapter_id ? BigInt(data.chapter_id) : null,
      user_id: data.user_id ? BigInt(data.user_id) : null,
      ip: data.ip || null,
      user_agent: data.user_agent || null,
    } as any);

    // Update stats (async, có thể dùng queue)
    await this.updateStats(data.comic_id, data.chapter_id);

    return { tracked: true };
  }

  /**
   * Aggregate views vào comic_stats
   */
  private async updateStats(comicId: number, chapterId?: number) {
    // Update comic view count
    const viewCount = await this.viewRepository.count({ comic_id: comicId });

    // Sử dụng upsert từ repository
    await this.statsRepository.upsert(comicId, {
      view_count: BigInt(viewCount),
    });

    // Update chapter view count nếu có
    if (chapterId) {
      const chapterViewCount = await this.viewRepository.count({ chapter_id: chapterId });

      await this.chapterRepository.update(chapterId, {
        view_count: BigInt(chapterViewCount),
      } as any);
    }
  }
}
