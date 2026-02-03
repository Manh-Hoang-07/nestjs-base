import { ComicFollow } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const FOLLOW_REPOSITORY = 'IFollowRepository';

export interface FollowFilter {
    user_id?: number | bigint;
    comic_id?: number | bigint;
}

export interface IFollowRepository extends IRepository<ComicFollow> {
    syncFollowCount(comicId: number | bigint): Promise<void>;
}


