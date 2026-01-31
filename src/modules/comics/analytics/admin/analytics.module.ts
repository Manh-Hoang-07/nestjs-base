import { Module } from '@nestjs/common';
import { AnalyticsController } from '@/modules/comics/analytics/admin/controllers/analytics.controller';
import { AnalyticsService } from '@/modules/comics/analytics/admin/services/analytics.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule { }



