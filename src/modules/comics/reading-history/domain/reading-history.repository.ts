import { ReadingHistory } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const READING_HISTORY_REPOSITORY = 'IReadingHistoryRepository';

export interface ReadingHistoryFilter {
    user_id?: number | bigint;
    comic_id?: number | bigint;
}

export interface IReadingHistoryRepository extends IRepository<ReadingHistory> {
}


