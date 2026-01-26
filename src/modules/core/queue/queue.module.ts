import { Module } from '@nestjs/common';
import { NotificationProcessor } from './processors/notification.processor';
import { ContentTemplateModule } from '../content-template/content-template.module';

@Module({
    imports: [
        ContentTemplateModule,
    ],
    providers: [NotificationProcessor],
    exports: [],
})
export class QueueWorkerModule { }
