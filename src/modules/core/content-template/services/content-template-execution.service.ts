import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
    CONTENT_TEMPLATE_REPOSITORY,
    IContentTemplateRepository
} from '../domain/content-template.repository';
import { ContentRendererService } from './content-renderer.service';
import { MailService } from '@/core/mail/mail.service';
import { TemplateType } from '@/shared/enums/types/template-type.enum';
import { TemplateCategory } from '@/shared/enums/types/template-category.enum';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

export interface ExecuteTemplateOptions {
    to: string | string[];
    variables: Record<string, any>;
    subject?: string;
    cc?: string | string[];
    bcc?: string | string[];
}

@Injectable()
export class ContentTemplateExecutionService {
    constructor(
        @Inject(CONTENT_TEMPLATE_REPOSITORY)
        private readonly repository: IContentTemplateRepository,
        private readonly renderer: ContentRendererService,
        private readonly mailService: MailService,
    ) { }

    /**
     * Execute a template by its code
     */
    async execute(code: string, options: ExecuteTemplateOptions) {
        const template = await this.repository.findByCode(code);

        if (!template || template.deleted_at) {
            throw new NotFoundException(`Content template with code ${code} not found`);
        }

        if (template.status !== BasicStatus.active) {
            throw new BadRequestException(`Content template with code ${code} is not active`);
        }

        if (template.category !== TemplateCategory.render) {
            throw new BadRequestException(`Template ${code} is of category ${template.category}, cannot be executed as render-type`);
        }

        // Render content
        const renderedContent = this.renderer.render(template.content || '', options.variables);

        // Determine subject
        const metadata = template.metadata as any;
        const rawSubject = options.subject || metadata?.subject || template.name;
        const finalSubject = this.renderer.render(rawSubject, options.variables);

        // Dispatch based on type
        switch (template.type) {
            case TemplateType.email:
                return this.handleEmail(renderedContent, finalSubject, options);

            case TemplateType.telegram:
                return this.handleTelegram(renderedContent, options);

            case TemplateType.zalo:
                return this.handleZalo(renderedContent, options);

            case TemplateType.sms:
                return this.handleSms(renderedContent, options);

            default:
                throw new BadRequestException(`Execution for template type ${template.type} is not yet implemented`);
        }
    }

    private async handleEmail(content: string, subject: string, options: ExecuteTemplateOptions) {
        await this.mailService.send({
            to: options.to,
            subject: subject,
            html: content,
            cc: options.cc,
            bcc: options.bcc,
        });
        return { success: true, channel: 'email' };
    }

    private async handleTelegram(content: string, options: ExecuteTemplateOptions) {
        // Placeholder for Telegram implementation
        // Future: Inject TelegramService
        console.log('TELEGRAM LOG:', { to: options.to, content });
        return { success: true, channel: 'telegram', note: 'Simulation only' };
    }

    private async handleZalo(content: string, options: ExecuteTemplateOptions) {
        // Placeholder for Zalo implementation
        console.log('ZALO LOG:', { to: options.to, content });
        return { success: true, channel: 'zalo', note: 'Simulation only' };
    }

    private async handleSms(content: string, options: ExecuteTemplateOptions) {
        // Placeholder for SMS implementation
        console.log('SMS LOG:', { to: options.to, content });
        return { success: true, channel: 'sms', note: 'Simulation only' };
    }
}
