import { ComicCategory } from '@prisma/client';
import { IRepository } from '@/common/core/repositories/repository.interface';

export const COMIC_CATEGORY_REPOSITORY = 'COMIC_CATEGORY_REPOSITORY';

export interface IComicCategoryRepository extends IRepository<ComicCategory> {
    findBySlug(slug: string): Promise<ComicCategory | null>;
}


