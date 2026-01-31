import { Module } from '@nestjs/common';
import { COMIC_REPOSITORY } from './domain/comic.repository';
import { ComicRepositoryImpl } from './infrastructure/repositories/comic.repository.impl';

@Module({
    providers: [
        {
            provide: COMIC_REPOSITORY,
            useClass: ComicRepositoryImpl,
        },
    ],
    exports: [COMIC_REPOSITORY],
})
export class ComicRepositoryModule { }
