import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IAboutRepository, AboutFilter } from '../../domain/about.repository';

@Injectable()
export class AboutRepositoryImpl extends PrismaRepository<any> implements IAboutRepository {
    constructor(prisma: PrismaService) {
        super(prisma.aboutSection);
    }

    protected buildWhere(filter: AboutFilter): any {
        const where: any = {};

        if (filter.search) {
            where.OR = [
                { title: { contains: filter.search } },
                { content: { contains: filter.search } },
            ];
        }

        if (filter.section_type) {
            where.section_type = filter.section_type;
        }

        if (filter.status) {
            where.status = filter.status;
        }

        return where;
    }

    async findBySlug(slug: string): Promise<any | null> {
        return this.findOne({ slug, status: 'active' });
    }
}
