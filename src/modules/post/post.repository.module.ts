import { Global, Module } from '@nestjs/common';
import { POST_REPOSITORY } from './post/domain/post.repository';
import { PostRepositoryImpl } from './post/infrastructure/repositories/post.repository.impl';
import { POST_TAG_REPOSITORY } from './post-tag/domain/post-tag.repository';
import { PostTagRepositoryImpl } from './post-tag/infrastructure/repositories/post-tag.repository.impl';
import { POST_CATEGORY_REPOSITORY } from './post-category/domain/post-category.repository';
import { PostCategoryRepositoryImpl } from './post-category/infrastructure/repositories/post-category.repository.impl';
import { POST_COMMENT_REPOSITORY } from './comment/domain/post-comment.repository';
import { PostCommentRepositoryImpl } from './comment/infrastructure/repositories/post-comment.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: POST_REPOSITORY,
            useClass: PostRepositoryImpl,
        },
        {
            provide: POST_TAG_REPOSITORY,
            useClass: PostTagRepositoryImpl,
        },
        {
            provide: POST_CATEGORY_REPOSITORY,
            useClass: PostCategoryRepositoryImpl,
        },
        {
            provide: POST_COMMENT_REPOSITORY,
            useClass: PostCommentRepositoryImpl,
        },
    ],
    exports: [POST_REPOSITORY, POST_TAG_REPOSITORY, POST_CATEGORY_REPOSITORY, POST_COMMENT_REPOSITORY],
})
export class PostRepositoryModule { }
