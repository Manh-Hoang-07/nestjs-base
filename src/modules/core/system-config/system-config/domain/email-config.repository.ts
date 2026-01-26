import { IRepository } from '@/common/core/repositories';
import { EmailConfig } from '@prisma/client';

export interface EmailConfigFilter {
    status?: string;
}

export interface IEmailConfigRepository extends IRepository<EmailConfig> {
    getConfig(): Promise<EmailConfig | null>;
}

export const EMAIL_CONFIG_REPOSITORY = 'EMAIL_CONFIG_REPOSITORY';
