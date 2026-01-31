import { Injectable } from '@nestjs/common';
import { Chapter, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IChapterRepository } from '../../domain/chapter.repository';

@Injectable()
export class ChapterRepositoryImpl extends PrismaRepository<
    Chapter,
    Prisma.ChapterWhereInput,
    Prisma.ChapterCreateInput,
    Prisma.ChapterUpdateInput,
    Prisma.ChapterOrderByWithRelationInput
> implements IChapterRepository {
    constructor(
        private readonly prisma: PrismaService,
    ) {
        super(prisma.chapter as any);
        this.defaultSelect = {
            id: true,
            comic_id: true,
            team_id: true,
            title: true,
            chapter_index: true,
            chapter_label: true,
            status: true,
            view_count: true,
            created_user_id: true,
            updated_user_id: true,
            created_at: true,
            updated_at: true,
            pages: {
                orderBy: {
                    page_number: 'asc',
                },
            },
            comic: {
                select: {
                    title: true,
                    slug: true,
                },
            },
        };
    }

    protected buildWhere(filter: any): Prisma.ChapterWhereInput {
        const where: Prisma.ChapterWhereInput = {
            deleted_at: null,
        };

        if (filter.comicId) where.comic_id = this.toPrimaryKey(filter.comicId);
        if (filter.status) where.status = filter.status;

        if (filter.search) {
            where.OR = [
                { title: { contains: filter.search } },
            ];
        }

        return where;
    }

    async findByComicIdAndIndex(comicId: number | bigint, index: number): Promise<Chapter | null> {
        return this.findOne({
            comic_id: this.toPrimaryKey(comicId),
            chapter_index: index,
            deleted_at: null,
        });
    }

    async getMaxIndex(comicId: number | bigint): Promise<number> {
        const result = await this.prisma.chapter.aggregate({
            where: {
                comic_id: this.toPrimaryKey(comicId),
                deleted_at: null,
            },
            _max: {
                chapter_index: true,
            },
        });
        return result._max.chapter_index || 0;
    }
}
