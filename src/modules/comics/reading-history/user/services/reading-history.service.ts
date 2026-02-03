import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ReadingHistory } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IReadingHistoryRepository, READING_HISTORY_REPOSITORY } from '../../domain/reading-history.repository';
import { RequestContext } from '@/common/shared/utils';

@Injectable()
export class ReadingHistoryService extends BaseService<ReadingHistory, IReadingHistoryRepository> {
  constructor(
    @Inject(READING_HISTORY_REPOSITORY)
    protected readonly readingHistoryRepository: IReadingHistoryRepository,
  ) {
    super(readingHistoryRepository);
  }

  protected override async prepareFilters(filters?: any) {
    const userId = RequestContext.get<number>('userId');
    return {
      ...(filters || {}),
      user_id: userId,
    };
  }

  protected override async prepareOptions(options: any = {}) {
    const base = await super.prepareOptions(options);
    return {
      ...base,
      include: options?.include ?? {
        comic: true,
        chapter: true,
      },
      sort: options?.sort ?? 'updated_at:desc',
    };
  }

  async updateOrCreate(comicId: number | bigint, chapterId: number | bigint) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) throw new UnauthorizedException();

    const existing = await this.repository.findOne({
      user_id: userId,
      comic_id: comicId,
    });

    if (existing) {
      const updated = await this.repository.update(existing.id, {
        chapter_id: chapterId,
      });
      return this.transform(updated);
    }

    const created = await this.repository.create({
      user_id: userId,
      comic_id: comicId,
      chapter_id: chapterId,
    });

    return this.transform(created);
  }

  async clearHistory(comicId: number | bigint) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) throw new UnauthorizedException();

    await this.repository.deleteMany({
      user_id: userId,
      comic_id: comicId,
    });

    return { success: true };
  }

  protected override transform(entity: any): any {
    return this.deepConvertBigInt(entity);
  }
}





