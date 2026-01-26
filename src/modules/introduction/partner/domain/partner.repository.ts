
import { Partner } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const PARTNER_REPOSITORY = 'IPartnerRepository';

export interface PartnerFilter {
    search?: string;
    status?: string;
    type?: string;
}

export interface IPartnerRepository extends IRepository<Partner> {
}
