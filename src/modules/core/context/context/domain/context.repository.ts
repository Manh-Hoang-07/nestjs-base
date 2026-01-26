
import { Context } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const CONTEXT_REPOSITORY = 'IContextRepository';

export interface ContextFilter {
    search?: string;
    type?: string;
    refId?: number | null;
    status?: string;
}

export interface IContextRepository extends IRepository<Context> {
    findByTypeAndRefId(type: string, refId: number | null): Promise<Context | null>;
    findByCode(code: string): Promise<Context | null>;
}
