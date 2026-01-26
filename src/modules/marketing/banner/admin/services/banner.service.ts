import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IBannerRepository, BANNER_REPOSITORY } from '@/modules/marketing/banner/domain/banner.repository';
import { IBannerLocationRepository, BANNER_LOCATION_REPOSITORY } from '@/modules/marketing/banner-location/domain/banner-location.repository';
import { BaseContentService } from '@/common/core/services';
import { Banner } from '@prisma/client';

@Injectable()
export class BannerService extends BaseContentService<Banner, IBannerRepository> {
    constructor(
        @Inject(BANNER_REPOSITORY)
        private readonly bannerRepo: IBannerRepository,
        @Inject(BANNER_LOCATION_REPOSITORY)
        private readonly locationRepo: IBannerLocationRepository,
    ) {
        super(bannerRepo);
    }

    protected defaultSort = 'sort_order:asc,created_at:desc';


    async getSimpleList(query: any) {
        return this.getList({
            ...query,
            limit: query.limit ?? 50,
        });
    }

    protected async beforeCreate(data: any) {
        if (data.location_id) {
            const location = await this.locationRepo.findById(data.location_id);
            if (!location) {
                throw new NotFoundException(`Vị trí banner với ID ${data.location_id} không tồn tại`);
            }
        }
        return data;
    }

    protected async beforeUpdate(id: number | bigint, data: any) {
        const current = await this.bannerRepo.findById(id);
        if (!current) throw new NotFoundException('Banner not found');

        if (data.location_id && data.location_id !== Number((current as any).location_id)) {
            const location = await this.locationRepo.findById(data.location_id);
            if (!location) {
                throw new NotFoundException(`Vị trí banner với ID ${data.location_id} không tồn tại`);
            }
        }
        return data;
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
