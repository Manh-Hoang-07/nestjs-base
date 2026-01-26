import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IBannerRepository, BANNER_REPOSITORY } from '@/modules/marketing/banner/domain/banner.repository';
import { IBannerLocationRepository, BANNER_LOCATION_REPOSITORY } from '@/modules/marketing/banner-location/domain/banner-location.repository';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { BaseService } from '@/common/core/services';
import { Banner } from '@prisma/client';

@Injectable()
export class PublicBannerService extends BaseService<Banner, IBannerRepository> {
    constructor(
        @Inject(BANNER_REPOSITORY)
        private readonly bannerRepo: IBannerRepository,
        @Inject(BANNER_LOCATION_REPOSITORY)
        private readonly locationRepo: IBannerLocationRepository,
    ) {
        super(bannerRepo);
    }

    protected async prepareFilters(filters?: Record<string, any>) {
        return {
            ...filters,
            status: BasicStatus.active,
        };
    }

    protected async afterGetOne(entity: Banner | null): Promise<Banner | null> {
        if (!entity || (entity as any).status !== BasicStatus.active) {
            return null;
        }
        return entity;
    }

    protected transform(banner: any) {
        if (!banner) return banner;
        const item = super.transform(banner) as any;
        if (item.location) {
            item.location = {
                id: Number(item.location.id),
                name: item.location.name,
                code: item.location.code,
            };
        }
        return item;
    }
}

