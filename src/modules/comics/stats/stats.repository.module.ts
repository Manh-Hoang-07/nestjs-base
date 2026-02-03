import { Module } from '@nestjs/common';
import { COMIC_STATS_REPOSITORY } from './domain/comic-stats.repository';
import { ComicStatsRepositoryImpl } from './infrastructure/repositories/comic-stats.repository.impl';
import { COMIC_VIEW_REPOSITORY } from './domain/comic-view.repository';
import { ComicViewRepositoryImpl } from './infrastructure/repositories/comic-view.repository.impl';

@Module({
    providers: [
        {
            provide: COMIC_STATS_REPOSITORY,
            useClass: ComicStatsRepositoryImpl,
        },
        {
            provide: COMIC_VIEW_REPOSITORY,
            useClass: ComicViewRepositoryImpl,
        },
    ],
    exports: [COMIC_STATS_REPOSITORY, COMIC_VIEW_REPOSITORY],
})
export class StatsRepositoryModule { }
