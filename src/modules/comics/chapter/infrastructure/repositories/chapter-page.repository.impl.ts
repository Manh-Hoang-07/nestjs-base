import { Injectable } from '@nestjs/common';
import { ChapterPage, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IChapterPageRepository, ChapterPageFilter } from '../../domain/chapter-page.repository';

@Injectable()
export class ChapterPageRepositoryImpl extends PrismaRepository<
    ChapterPage,
    Prisma.ChapterPageWhereInput,
    Prisma.ChapterPageCreateInput,
    Prisma.ChapterPageUpdateInput,
    Prisma.ChapterPageOrderByWithRelationInput
> implements IChapterPageRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.chapterPage as any);
        this.isSoftDelete = false;
    }

    protected buildWhere(filter: ChapterPageFilter): Prisma.ChapterPageWhereInput {
        const where: Prisma.ChapterPageWhereInput = {};
        if (filter.chapter_id) where.chapter_id = this.toPrimaryKey(filter.chapter_id);
        return where;
    }

    async createMany(data: any[]): Promise<void> {
        await this.prisma.chapterPage.createMany({
            data,
        });
    }
}


