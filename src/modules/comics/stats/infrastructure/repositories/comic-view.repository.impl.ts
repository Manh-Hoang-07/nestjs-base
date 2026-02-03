import { Injectable } from '@nestjs/common';
import { ComicView, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IComicViewRepository, ComicViewFilter } from '../../domain/comic-view.repository';

@Injectable()
export class ComicViewRepositoryImpl extends PrismaRepository<
    ComicView,
    Prisma.ComicViewWhereInput,
    Prisma.ComicViewCreateInput,
    Prisma.ComicViewUpdateInput,
    Prisma.ComicViewOrderByWithRelationInput
> implements IComicViewRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.comicView as any);
        this.isSoftDelete = false;
    }

    protected buildWhere(filter: ComicViewFilter): Prisma.ComicViewWhereInput {
        const where: Prisma.ComicViewWhereInput = {};
        if (filter.comic_id) where.comic_id = this.toPrimaryKey(filter.comic_id);
        if (filter.chapter_id) where.chapter_id = this.toPrimaryKey(filter.chapter_id);
        if (filter.user_id) where.user_id = this.toPrimaryKey(filter.user_id);

        if (filter.date_from || filter.date_to) {
            where.created_at = {};
            if (filter.date_from) where.created_at.gte = filter.date_from;
            if (filter.date_to) where.created_at.lte = filter.date_to;
        }

        if (filter.group_id) {
            where.comic = {
                group_id: this.toPrimaryKey(filter.group_id)
            };
        }

        return where;

    }
}


