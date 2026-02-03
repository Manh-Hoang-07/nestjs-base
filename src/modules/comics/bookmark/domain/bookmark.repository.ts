import { Bookmark } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const BOOKMARK_REPOSITORY = 'IBookmarkRepository';

export interface BookmarkFilter {
    user_id?: number | bigint;
    comic_id?: number | bigint;
    chapter_id?: number | bigint;
}

export interface IBookmarkRepository extends IRepository<Bookmark> {
}


