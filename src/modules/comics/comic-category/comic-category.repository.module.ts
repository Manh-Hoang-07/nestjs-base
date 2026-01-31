import { Module } from '@nestjs/common';
import { COMIC_CATEGORY_REPOSITORY } from './domain/comic-category.repository';
import { ComicCategoryRepositoryImpl } from './infrastructure/repositories/comic-category.repository.impl';

@Module({
    providers: [
        {
            provide: COMIC_CATEGORY_REPOSITORY,
            useClass: ComicCategoryRepositoryImpl,
        },
    ],
    exports: [COMIC_CATEGORY_REPOSITORY],
})
export class ComicCategoryRepositoryModule { }
