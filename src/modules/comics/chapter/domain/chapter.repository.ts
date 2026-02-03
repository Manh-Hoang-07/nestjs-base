import { Chapter } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const CHAPTER_REPOSITORY = 'IChapterRepository';

export interface ChapterFilter {
    comic_id?: number | bigint;
    chapter_index?: number;
    status?: string | { in: string[] };
    search?: string;
    group_id?: number | bigint;
}

export interface IChapterRepository extends IRepository<Chapter> {
    findByComicIdAndIndex(comicId: number | bigint, index: number): Promise<Chapter | null>;
    getMaxIndex(comicId: number | bigint): Promise<number>;
}


