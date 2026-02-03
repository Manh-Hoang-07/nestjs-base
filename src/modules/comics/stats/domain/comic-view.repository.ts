import { ComicView } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const COMIC_VIEW_REPOSITORY = 'IComicViewRepository';

export interface ComicViewFilter {
    comic_id?: number | bigint;
    chapter_id?: number | bigint;
    user_id?: number | bigint;
    date_from?: Date;
    date_to?: Date;
    group_id?: number | bigint;
}


export interface IComicViewRepository extends IRepository<ComicView> {
}


