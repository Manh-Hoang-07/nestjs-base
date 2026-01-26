import { Global, Module } from '@nestjs/common';
import { CONTENT_TEMPLATE_REPOSITORY } from './domain/content-template.repository';
import { ContentTemplateRepositoryImpl } from './infrastructure/repositories/content-template.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: CONTENT_TEMPLATE_REPOSITORY,
            useClass: ContentTemplateRepositoryImpl,
        },
    ],
    exports: [CONTENT_TEMPLATE_REPOSITORY],
})
export class ContentTemplateRepositoryModule { }
