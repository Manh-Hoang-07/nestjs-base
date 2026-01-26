import { Module } from '@nestjs/common';
import { BannerService } from '@/modules/marketing/banner/admin/services/banner.service';
import { BannerController } from '@/modules/marketing/banner/admin/controllers/banner.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { MarketingRepositoryModule } from '@/modules/marketing/marketing.repository.module';

@Module({
    imports: [
        RbacModule,
        MarketingRepositoryModule,
    ],
    controllers: [BannerController],
    providers: [BannerService],
    exports: [BannerService],
})
export class AdminBannerModule { }
