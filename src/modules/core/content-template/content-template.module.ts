import { Module } from '@nestjs/common';
import { ContentTemplateAdminModule } from './admin/content-template.module';
import { ContentTemplateRepositoryModule } from './content-template.repository.module';

@Module({
    imports: [
        ContentTemplateRepositoryModule,
        ContentTemplateAdminModule,
    ],
    exports: [
        ContentTemplateRepositoryModule,
        ContentTemplateAdminModule,
    ],
})
export class ContentTemplateModule { }
