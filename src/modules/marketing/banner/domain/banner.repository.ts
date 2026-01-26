
import { Banner } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const BANNER_REPOSITORY = 'IBannerRepository';

export interface BannerFilter {
    search?: string;
    status?: string;
    locationId?: number | bigint;
    locationCode?: string;
}

export interface IBannerRepository extends IRepository<Banner> {
    findAllByLocation(locationCode: string): Promise<Banner[]>;
}
