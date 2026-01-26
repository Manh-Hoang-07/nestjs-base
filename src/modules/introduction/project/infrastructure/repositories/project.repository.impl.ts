import { Injectable } from '@nestjs/common';
import { Project, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IProjectRepository, ProjectFilter } from '../../domain/project.repository';

@Injectable()
export class ProjectRepositoryImpl extends PrismaRepository<
    Project,
    Prisma.ProjectWhereInput,
    Prisma.ProjectCreateInput,
    Prisma.ProjectUpdateInput,
    Prisma.ProjectOrderByWithRelationInput
> implements IProjectRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.project as unknown as any, 'sort_order:asc');
    }

    protected buildWhere(filter: ProjectFilter): Prisma.ProjectWhereInput {
        const where: Prisma.ProjectWhereInput = {};

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { slug: { contains: filter.search } },
            ];
        }

        if (filter.status) {
            where.status = filter.status as any;
        }

        if (filter.isFeatured !== undefined) {
            where.featured = filter.isFeatured;
        }

        return where;
    }

    async findBySlug(slug: string): Promise<Project | null> {
        return this.findOne({ slug });
    }

    async incrementViewCount(id: number | bigint): Promise<Project> {
        return this.update(id, { view_count: { increment: 1 } });
    }
}
