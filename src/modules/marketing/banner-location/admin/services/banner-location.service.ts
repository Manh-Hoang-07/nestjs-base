import { Injectable, ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { IBannerLocationRepository, BANNER_LOCATION_REPOSITORY, BannerLocationFilter } from '@/modules/marketing/banner-location/domain/banner-location.repository';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { BaseService } from '@/common/core/services';
import { BannerLocation } from '@prisma/client';

@Injectable()
export class BannerLocationService extends BaseService<BannerLocation, IBannerLocationRepository> {
    constructor(
        @Inject(BANNER_LOCATION_REPOSITORY)
        private readonly locationRepo: IBannerLocationRepository,
    ) {
        super(locationRepo);
    }


    async getSimpleList(query: any) {
        return this.getList({
            ...query,
            limit: query.limit ?? 50,
        });
    }

    protected async beforeCreate(data: any) {
        if (data.code) {
            const exists = await this.locationRepo.findByCode(data.code);
            if (exists) {
                throw new ConflictException(`Mã vị trí banner "${data.code}" đã tồn tại`);
            }
        }
        return data;
    }

    protected async beforeUpdate(id: number, data: any) {
        const current = await this.locationRepo.findById(id);
        if (!current) throw new NotFoundException('Banner location not found');

        if (data.code && data.code !== (current as any).code) {
            const exists = await this.locationRepo.findByCode(data.code);
            if (exists) {
                throw new ConflictException(`Mã vị trí banner "${data.code}" đã tồn tại`);
            }
        }
        return data;
    }

    async changeStatus(id: number, status: BasicStatus) {
        return this.update(id, { status: status as any });
    }
}
