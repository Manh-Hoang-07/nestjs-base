import { IRepository } from '@/common/core/repositories';
import { GeneralConfig } from '@prisma/client';

export interface GeneralConfigFilter {
    search?: string;
    status?: string;
}

export interface IGeneralConfigRepository extends IRepository<GeneralConfig> {
    getConfig(): Promise<GeneralConfig | null>;
}

export const GENERAL_CONFIG_REPOSITORY = 'GENERAL_CONFIG_REPOSITORY';
