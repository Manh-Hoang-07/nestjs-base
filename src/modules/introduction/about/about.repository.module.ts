import { Global, Module } from '@nestjs/common';
import { ABOUT_REPOSITORY } from './domain/about.repository';
import { AboutRepositoryImpl } from './infrastructure/repositories/about.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: ABOUT_REPOSITORY,
            useClass: AboutRepositoryImpl,
        },
    ],
    exports: [ABOUT_REPOSITORY],
})
export class AboutRepositoryModule { }
