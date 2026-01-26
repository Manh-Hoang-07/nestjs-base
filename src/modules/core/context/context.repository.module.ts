import { Global, Module } from '@nestjs/common';
import { CONTEXT_REPOSITORY } from './context/domain/context.repository';
import { ContextRepositoryImpl } from './context/infrastructure/repositories/context.repository.impl';
import { GROUP_REPOSITORY } from './group/domain/group.repository';
import { GroupRepositoryImpl } from './group/infrastructure/repositories/group.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: CONTEXT_REPOSITORY,
            useClass: ContextRepositoryImpl,
        },
        {
            provide: GROUP_REPOSITORY,
            useClass: GroupRepositoryImpl,
        },
    ],
    exports: [CONTEXT_REPOSITORY, GROUP_REPOSITORY],
})
export class ContextRepositoryModule { }
