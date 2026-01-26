import { Module } from '@nestjs/common';
import { MarketingRepositoryModule } from './marketing.repository.module';

// Import admin modules
import { AdminBannerModule } from '@/modules/marketing/banner/admin/banner.module';
import { AdminBannerLocationModule } from '@/modules/marketing/banner-location/admin/banner-location.module';

// Import public modules
import { PublicBannerModule } from '@/modules/marketing/banner/public/banner.module';

@Module({
    imports: [
        MarketingRepositoryModule,
        // Admin modules
        AdminBannerModule,
        AdminBannerLocationModule,
        // Public modules
        PublicBannerModule,
    ],
    exports: [],
})
export class MarketingModule { }
