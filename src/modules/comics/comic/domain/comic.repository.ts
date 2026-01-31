import { Comic } from '@prisma/client';
import { IRepository } from '@/common/core/repositories/repository.interface';

export const COMIC_REPOSITORY = 'COMIC_REPOSITORY';

export interface IComicRepository extends IRepository<Comic> {
    findBySlug(slug: string): Promise<Comic | null>;
    syncCategories(comicId: bigint, categoryIds: bigint[]): Promise<void>;
}
