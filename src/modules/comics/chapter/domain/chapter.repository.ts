import { Chapter } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const CHAPTER_REPOSITORY = 'IChapterRepository';

export interface ChapterFilter {
    comic_id?: number | bigint;
    status?: string | { in: string[] };
    search?: string;
    deleted_at?: Date | null;
}

export interface IChapterRepository extends IRepository<Chapter> {
    findByComicIdAndIndex(comicId: number | bigint, index: number): Promise<Chapter | null>;
    getMaxIndex(comicId: number | bigint): Promise<number>;
}
