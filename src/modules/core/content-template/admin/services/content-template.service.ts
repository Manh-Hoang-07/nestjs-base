import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import {
    CONTENT_TEMPLATE_REPOSITORY,
    IContentTemplateRepository
} from '../../domain/content-template.repository';
import { BaseService } from '@/common/core/services';
import { ContentTemplate } from '@prisma/client';

@Injectable()
export class ContentTemplateService extends BaseService<ContentTemplate, IContentTemplateRepository> {
    constructor(
        @Inject(CONTENT_TEMPLATE_REPOSITORY)
        repository: IContentTemplateRepository,
    ) {
        super(repository);
    }

    async findByCode(code: string): Promise<ContentTemplate> {
        const item = await this.repository.findByCode(code);
        if (!item) {
            throw new NotFoundException(`Content template with code ${code} not found`);
        }
        return item;
    }

    protected async beforeCreate(data: any) {
        if (data.code) {
            const existing = await this.repository.findByCode(data.code);
            if (existing) {
                throw new ConflictException(`Content template with code ${data.code} already exists`);
            }
        }
        return data;
    }

    protected async beforeUpdate(id: number | string | bigint, data: any) {
        if (data.code) {
            const existing = await this.repository.findByCode(data.code);
            if (existing && String(existing.id) !== String(id)) {
                throw new ConflictException(`Content template with code ${data.code} already exists`);
            }
        }
        return data;
    }
}
