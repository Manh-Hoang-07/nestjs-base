import { Module } from '@nestjs/common';
import { FOLLOW_REPOSITORY } from './domain/follow.repository';
import { FollowRepositoryImpl } from './infrastructure/repositories/follow.repository.impl';

@Module({
    providers: [
        {
            provide: FOLLOW_REPOSITORY,
            useClass: FollowRepositoryImpl,
        },
    ],
    exports: [FOLLOW_REPOSITORY],
})
export class FollowRepositoryModule { }
