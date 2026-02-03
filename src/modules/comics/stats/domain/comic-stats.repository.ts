import { ComicStats } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const COMIC_STATS_REPOSITORY = 'IComicStatsRepository';

export interface ComicStatsFilter {
    comic_id?: number | bigint;
    group_id?: number | bigint;
}

export interface IComicStatsRepository extends IRepository<ComicStats> {
    sum(field: keyof ComicStats, filter?: ComicStatsFilter): Promise<number>;
}



