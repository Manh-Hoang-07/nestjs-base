import { Chapter } from '@prisma/client';
import { IRepository } from '@/common/core/repositories/repository.interface';

export const CHAPTER_REPOSITORY = 'CHAPTER_REPOSITORY';

export interface IChapterRepository extends IRepository<Chapter> {
    findByComicIdAndIndex(comicId: bigint, index: number): Promise<Chapter | null>;
    getMaxIndex(comicId: bigint): Promise<number>;
}
