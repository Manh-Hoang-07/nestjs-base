import { Module } from '@nestjs/common';
import { COMMENT_REPOSITORY } from './domain/comment.repository';
import { CommentRepositoryImpl } from './infrastructure/repositories/comment.repository.impl';

@Module({
    providers: [
        {
            provide: COMMENT_REPOSITORY,
            useClass: CommentRepositoryImpl,
        },
    ],
    exports: [COMMENT_REPOSITORY],
})
export class CommentRepositoryModule { }
