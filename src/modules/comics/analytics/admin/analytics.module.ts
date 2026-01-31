import { Module } from '@nestjs/common';
import { AnalyticsController } from '@/modules/comics/admin/analytics/controllers/analytics.controller';
import { AnalyticsService } from '@/modules/comics/admin/analytics/services/analytics.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}



