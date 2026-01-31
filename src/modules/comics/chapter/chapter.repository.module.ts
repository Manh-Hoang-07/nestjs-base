import { Module } from '@nestjs/common';
import { CHAPTER_REPOSITORY } from './domain/chapter.repository';
import { ChapterRepositoryImpl } from './infrastructure/repositories/chapter.repository.impl';

@Module({
    providers: [
        {
            provide: CHAPTER_REPOSITORY,
            useClass: ChapterRepositoryImpl,
        },
    ],
    exports: [CHAPTER_REPOSITORY],
})
export class ChapterRepositoryModule { }
