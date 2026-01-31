import { Module } from '@nestjs/common';
import { BOOKMARK_REPOSITORY } from './domain/bookmark.repository';
import { BookmarkRepositoryImpl } from './infrastructure/repositories/bookmark.repository.impl';

@Module({
    providers: [
        {
            provide: BOOKMARK_REPOSITORY,
            useClass: BookmarkRepositoryImpl,
        },
    ],
    exports: [BOOKMARK_REPOSITORY],
})
export class BookmarkRepositoryModule { }
