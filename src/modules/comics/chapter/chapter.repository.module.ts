import { Module } from '@nestjs/common';
import { CHAPTER_REPOSITORY } from './domain/chapter.repository';
import { ChapterRepositoryImpl } from './infrastructure/repositories/chapter.repository.impl';
import { CHAPTER_PAGE_REPOSITORY } from './domain/chapter-page.repository';
import { ChapterPageRepositoryImpl } from './infrastructure/repositories/chapter-page.repository.impl';

@Module({
    providers: [
        {
            provide: CHAPTER_REPOSITORY,
            useClass: ChapterRepositoryImpl,
        },
        {
            provide: CHAPTER_PAGE_REPOSITORY,
            useClass: ChapterPageRepositoryImpl,
        },
    ],
    exports: [CHAPTER_REPOSITORY, CHAPTER_PAGE_REPOSITORY],
})
export class ChapterRepositoryModule { }
