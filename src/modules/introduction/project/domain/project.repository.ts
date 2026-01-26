
import { Project } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const PROJECT_REPOSITORY = 'IProjectRepository';

export interface ProjectFilter {
    search?: string;
    status?: string;
    isFeatured?: boolean;
}

export interface IProjectRepository extends IRepository<Project> {
    findBySlug(slug: string): Promise<Project | null>;
    incrementViewCount(id: number | bigint): Promise<Project>;
}
