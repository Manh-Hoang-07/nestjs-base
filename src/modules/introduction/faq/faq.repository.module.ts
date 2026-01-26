import { Global, Module } from '@nestjs/common';
import { FAQ_REPOSITORY } from './domain/faq.repository';
import { FaqRepositoryImpl } from './infrastructure/repositories/faq.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: FAQ_REPOSITORY,
            useClass: FaqRepositoryImpl,
        },
    ],
    exports: [FAQ_REPOSITORY],
})
export class FaqRepositoryModule { }
