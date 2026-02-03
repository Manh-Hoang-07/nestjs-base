import { Injectable } from '@nestjs/common';
import { TrackingHistory, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { ITrackingHistoryRepository, TrackingHistoryFilter } from '../../domain/tracking-history.repository';

@Injectable()
export class TrackingHistoryRepositoryImpl extends PrismaRepository<
    TrackingHistory,
    Prisma.TrackingHistoryWhereInput,
    Prisma.TrackingHistoryCreateInput,
    Prisma.TrackingHistoryUpdateInput,
    Prisma.TrackingHistoryOrderByWithRelationInput
> implements ITrackingHistoryRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.trackingHistory as any);
    }

    protected buildWhere(filter: TrackingHistoryFilter): Prisma.TrackingHistoryWhereInput {
        const where: Prisma.TrackingHistoryWhereInput = {};
        if (filter.orderId) where.order_id = this.toPrimaryKey(filter.orderId);
        return where;
    }

    async findByOrderId(orderId: number | bigint): Promise<TrackingHistory[]> {
        return this.findMany({ orderId });
    }
}


