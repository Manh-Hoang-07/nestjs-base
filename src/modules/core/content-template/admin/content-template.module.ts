import { Module, forwardRef } from '@nestjs/common';
import { ContentTemplateController } from './controllers/content-template.controller';
import { ContentTemplateService } from './services/content-template.service';
import { ContentTemplateRepositoryModule } from '../content-template.repository.module';
import { ContentRendererService } from '../services/content-renderer.service';
import { ContentTemplateExecutionService } from '../services/content-template-execution.service';
import { AppMailModule } from '@/core/mail/mail.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
    imports: [
        ContentTemplateRepositoryModule,
        AppMailModule,
        RbacModule,
    ],
    controllers: [ContentTemplateController],
    providers: [
        ContentTemplateService,
        ContentRendererService,
        ContentTemplateExecutionService,
    ],
    exports: [ContentTemplateService, ContentTemplateExecutionService, ContentRendererService],
})
export class ContentTemplateAdminModule { }
