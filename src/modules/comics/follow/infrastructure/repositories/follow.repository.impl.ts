import { Injectable } from '@nestjs/common';
import { ComicFollow, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IFollowRepository, FollowFilter } from '../../domain/follow.repository';

@Injectable()
export class FollowRepositoryImpl extends PrismaRepository<
    ComicFollow,
    Prisma.ComicFollowWhereInput,
    Prisma.ComicFollowCreateInput,
    Prisma.ComicFollowUpdateInput,
    Prisma.ComicFollowOrderByWithRelationInput
> implements IFollowRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.comicFollow as any);
        this.isSoftDelete = false;
    }

    protected buildWhere(filter: FollowFilter): Prisma.ComicFollowWhereInput {
        const where: Prisma.ComicFollowWhereInput = {};
        if (filter.user_id) where.user_id = this.toPrimaryKey(filter.user_id);
        if (filter.comic_id) where.comic_id = this.toPrimaryKey(filter.comic_id);
        return where;
    }

    async syncFollowCount(comicId: number | bigint): Promise<void> {
        const id = this.toPrimaryKey(comicId);
        const count = await this.prisma.comicFollow.count({
            where: { comic_id: id },
        });

        await this.prisma.comicStats.upsert({
            where: { comic_id: id },
            create: {
                comic_id: id,
                view_count: 0,
                follow_count: count,
                rating_count: 0,
                rating_sum: 0,
            },
            update: {
                follow_count: count,
            },
        });
    }
}


