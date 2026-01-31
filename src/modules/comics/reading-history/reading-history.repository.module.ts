import { Module } from '@nestjs/common';
import { READING_HISTORY_REPOSITORY } from './domain/reading-history.repository';
import { ReadingHistoryRepositoryImpl } from './infrastructure/repositories/reading-history.repository.impl';

@Module({
    providers: [
        {
            provide: READING_HISTORY_REPOSITORY,
            useClass: ReadingHistoryRepositoryImpl,
        },
    ],
    exports: [READING_HISTORY_REPOSITORY],
})
export class ReadingHistoryRepositoryModule { }
