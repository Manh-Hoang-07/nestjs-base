import { TrackingHistory } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const TRACKING_HISTORY_REPOSITORY = 'ITrackingHistoryRepository';

export interface TrackingHistoryFilter {
    orderId?: number | bigint;
}

export interface ITrackingHistoryRepository extends IRepository<TrackingHistory> {
    findByOrderId(orderId: number | bigint): Promise<TrackingHistory[]>;
}
