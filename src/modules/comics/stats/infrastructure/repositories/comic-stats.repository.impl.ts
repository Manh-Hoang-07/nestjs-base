import { Injectable } from '@nestjs/common';
import { ComicStats, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IComicStatsRepository, ComicStatsFilter } from '../../domain/comic-stats.repository';

@Injectable()
export class ComicStatsRepositoryImpl extends PrismaRepository<
    ComicStats,
    Prisma.ComicStatsWhereInput,
    Prisma.ComicStatsCreateInput,
    Prisma.ComicStatsUpdateInput,
    Prisma.ComicStatsOrderByWithRelationInput
> implements IComicStatsRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.comicStats as any);
        this.isSoftDelete = false;
    }

    protected buildWhere(filter: ComicStatsFilter): Prisma.ComicStatsWhereInput {
        const where: Prisma.ComicStatsWhereInput = {};
        if (filter.comic_id) where.comic_id = this.toPrimaryKey(filter.comic_id);
        if (filter.group_id) {
            where.comic = {
                group_id: this.toPrimaryKey(filter.group_id)
            } as any;
        }

        return where;
    }

    async sum(field: keyof ComicStats, filter: ComicStatsFilter = {}): Promise<number> {
        const where = this.buildWhere(filter);
        const result = await this.prisma.comicStats.aggregate({
            where,
            _sum: {
                [field]: true,
            },
        });
        return Number(result._sum[field] || 0);
    }

}


