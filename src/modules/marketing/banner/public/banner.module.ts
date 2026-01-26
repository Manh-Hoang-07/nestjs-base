import { Module } from '@nestjs/common';
import { PublicBannerService } from '@/modules/marketing/banner/public/services/banner.service';
import { PublicBannerController } from '@/modules/marketing/banner/public/controllers/banner.controller';
import { MarketingRepositoryModule } from '@/modules/marketing/marketing.repository.module';

@Module({
    imports: [MarketingRepositoryModule],
    controllers: [PublicBannerController],
    providers: [PublicBannerService],
    exports: [PublicBannerService],
})
export class PublicBannerModule { }
