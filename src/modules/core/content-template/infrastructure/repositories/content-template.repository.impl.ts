import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { ContentTemplate, Prisma } from '@prisma/client';
import { IContentTemplateRepository, ContentTemplateFilter } from '../../domain/content-template.repository';

@Injectable()
export class ContentTemplateRepositoryImpl
    extends PrismaRepository<ContentTemplate>
    implements IContentTemplateRepository {
    constructor(prisma: PrismaService) {
        super(prisma.contentTemplate);
    }

    protected buildWhere(filter: ContentTemplateFilter): Prisma.ContentTemplateWhereInput {
        const where: Prisma.ContentTemplateWhereInput = {
            deleted_at: null,
        };

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { code: { contains: filter.search } },
            ];
        }

        if (filter.category) {
            where.category = filter.category;
        }

        if (filter.type) {
            where.type = filter.type;
        }

        if (filter.code) {
            where.code = filter.code;
        }

        if (filter.status) {
            where.status = filter.status;
        }

        return where;
    }

    async findByCode(code: string): Promise<ContentTemplate | null> {
        return this.findOne({ code, deleted_at: null });
    }
}
