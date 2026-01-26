import { IRepository, IPaginatedResult, IPaginationOptions } from '@/common/core/repositories';

export interface AboutFilter {
    search?: string;
    section_type?: string;
    status?: string;
}

export interface IAboutRepository extends IRepository<any> {
    findBySlug(slug: string): Promise<any | null>;
}

export const ABOUT_REPOSITORY = 'ABOUT_REPOSITORY';
