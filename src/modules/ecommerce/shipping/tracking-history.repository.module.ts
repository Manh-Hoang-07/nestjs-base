import { Module } from '@nestjs/common';
import { TRACKING_HISTORY_REPOSITORY } from './domain/tracking-history.repository';
import { TrackingHistoryRepositoryImpl } from './infrastructure/repositories/tracking-history.repository.impl';

@Module({
    providers: [
        {
            provide: TRACKING_HISTORY_REPOSITORY,
            useClass: TrackingHistoryRepositoryImpl,
        },
    ],
    exports: [TRACKING_HISTORY_REPOSITORY],
})
export class TrackingHistoryRepositoryModule { }
