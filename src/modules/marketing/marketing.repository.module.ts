import { Global, Module } from '@nestjs/common';
import { BANNER_REPOSITORY } from './banner/domain/banner.repository';
import { BannerRepositoryImpl } from './banner/infrastructure/repositories/banner.repository.impl';
import { BANNER_LOCATION_REPOSITORY } from './banner-location/domain/banner-location.repository';
import { BannerLocationRepositoryImpl } from './banner-location/infrastructure/repositories/banner-location.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: BANNER_REPOSITORY,
            useClass: BannerRepositoryImpl,
        },
        {
            provide: BANNER_LOCATION_REPOSITORY,
            useClass: BannerLocationRepositoryImpl,
        },
    ],
    exports: [BANNER_REPOSITORY, BANNER_LOCATION_REPOSITORY],
})
export class MarketingRepositoryModule { }
