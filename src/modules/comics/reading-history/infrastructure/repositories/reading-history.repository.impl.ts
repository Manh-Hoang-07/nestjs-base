import { Injectable } from '@nestjs/common';
import { ReadingHistory, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IReadingHistoryRepository, ReadingHistoryFilter } from '../../domain/reading-history.repository';

@Injectable()
export class ReadingHistoryRepositoryImpl extends PrismaRepository<
    ReadingHistory,
    Prisma.ReadingHistoryWhereInput,
    Prisma.ReadingHistoryCreateInput,
    Prisma.ReadingHistoryUpdateInput,
    Prisma.ReadingHistoryOrderByWithRelationInput
> implements IReadingHistoryRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.readingHistory as any);
        this.isSoftDelete = false;
    }

    protected buildWhere(filter: ReadingHistoryFilter): Prisma.ReadingHistoryWhereInput {
        const where: Prisma.ReadingHistoryWhereInput = {};
        if (filter.user_id) where.user_id = this.toPrimaryKey(filter.user_id);
        if (filter.comic_id) where.comic_id = this.toPrimaryKey(filter.comic_id);
        return where;
    }
}


