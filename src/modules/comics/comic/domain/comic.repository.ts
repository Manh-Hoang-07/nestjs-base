import { Comic } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const COMIC_REPOSITORY = 'IComicRepository';

export interface ComicFilter {
    status?: string;
    author?: string;
    search?: string;
    categoryId?: number | bigint;
    excludeId?: number | bigint;
    created_user_id?: number | bigint;
    deleted_at?: Date | null;
    group_id?: number | bigint;
}

export interface IComicRepository extends IRepository<Comic> {
    findBySlug(slug: string): Promise<Comic | null>;
    syncCategories(comicId: number | bigint, categoryIds: (number | bigint)[]): Promise<void>;
    incrementView(comicId: number | bigint): Promise<void>;
    getChapters(id: number | bigint, options?: any): Promise<any>;
}
