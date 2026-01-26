import { Global, Module } from '@nestjs/common';
import { PROJECT_REPOSITORY } from './domain/project.repository';
import { ProjectRepositoryImpl } from './infrastructure/repositories/project.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: PROJECT_REPOSITORY,
            useClass: ProjectRepositoryImpl,
        },
    ],
    exports: [PROJECT_REPOSITORY],
})
export class ProjectRepositoryModule { }
