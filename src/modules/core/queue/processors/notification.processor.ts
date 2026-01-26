import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ContentTemplateExecutionService } from '@/modules/core/content-template/services/content-template-execution.service';
import { Logger } from '@nestjs/common';

@Processor('notification')
export class NotificationProcessor {
    private readonly logger = new Logger(NotificationProcessor.name);

    constructor(
        private readonly contentTemplateService: ContentTemplateExecutionService
    ) { }

    @Process('send_email_template')
    async handleSendEmail(job: Job) {
        this.logger.debug(`Processing job ${job.id}: send_email_template`);
        try {
            const { templateCode, options } = job.data;
            await this.contentTemplateService.execute(templateCode, options);
            this.logger.debug(`Job ${job.id} completed`);
        } catch (error) {
            this.logger.error(`Job ${job.id} failed`, error);
            throw error;
        }
    }

    // Future expansion:
    // @Process({ name: 'send_order_email', concurrency: 10 })
}
