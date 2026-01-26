import { Module } from '@nestjs/common';
import { BannerLocationService } from '@/modules/marketing/banner-location/admin/services/banner-location.service';
import { BannerLocationController } from '@/modules/marketing/banner-location/admin/controllers/banner-location.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { MarketingRepositoryModule } from '@/modules/marketing/marketing.repository.module';

@Module({
    imports: [
        RbacModule,
        MarketingRepositoryModule,
    ],
    controllers: [BannerLocationController],
    providers: [BannerLocationService],
    exports: [BannerLocationService],
})
export class AdminBannerLocationModule { }
