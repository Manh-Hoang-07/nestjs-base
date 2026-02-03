import { Injectable, Inject } from '@nestjs/common';
import { toPlain } from '@/common/shared/utils';
import { createPaginationMeta } from '@/common/core/utils';
import { IReadingHistoryRepository, READING_HISTORY_REPOSITORY } from '../../../reading-history/domain/reading-history.repository';
import { IFollowRepository, FOLLOW_REPOSITORY } from '../../../follow/domain/follow.repository';
import { IBookmarkRepository, BOOKMARK_REPOSITORY } from '../../../bookmark/domain/bookmark.repository';

@Injectable()
export class UserStatsService {
  constructor(
    @Inject(READING_HISTORY_REPOSITORY)
    private readonly readingHistoryRepository: IReadingHistoryRepository,
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: IFollowRepository,
    @Inject(BOOKMARK_REPOSITORY)
    private readonly bookmarkRepository: IBookmarkRepository,
  ) { }

  /**
   * Lấy dashboard data cho user
   */
  async getDashboard(userId: number) {
    const [readingHistory, follows, bookmarks, readingCount, followCount, bookmarkCount] = await Promise.all([
      this.readingHistoryRepository.findMany({ user_id: userId }, {
        include: { comic: true, chapter: true },
        sort: 'updated_at:DESC',
        limit: 10,
      } as any),
      this.followRepository.findMany({ user_id: userId }, {
        include: { comic: true },
        sort: 'created_at:DESC',
        limit: 10,
      } as any),
      this.bookmarkRepository.findMany({ user_id: userId }, {
        include: { chapter: { include: { comic: true } } },
        sort: 'created_at:DESC',
        limit: 10,
      } as any),
      this.readingHistoryRepository.count({ user_id: userId }),
      this.followRepository.count({ user_id: userId }),
      this.bookmarkRepository.count({ user_id: userId }),
    ]);

    return {
      reading_history: toPlain(readingHistory),
      follows: toPlain(follows),
      bookmarks: toPlain(bookmarks),
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
    const { data: history, meta } = await this.readingHistoryRepository.findAll({
      filter: { user_id: userId },
      include: { comic: true, chapter: true },
      sort: 'updated_at:DESC',
      page,
      limit,
    } as any);

    return {
      data: toPlain(history.map((h: any) => ({
        comic: h.comic,
        last_read_chapter: h.chapter,
        last_read_at: h.updated_at,
      }))),
      meta,
    };
  }
}
