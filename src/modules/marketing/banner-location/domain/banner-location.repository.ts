
import { BannerLocation } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const BANNER_LOCATION_REPOSITORY = 'IBannerLocationRepository';

export interface BannerLocationFilter {
    search?: string;
    status?: string;
}

export interface IBannerLocationRepository extends IRepository<BannerLocation> {
    findByCode(code: string): Promise<BannerLocation | null>;
}
