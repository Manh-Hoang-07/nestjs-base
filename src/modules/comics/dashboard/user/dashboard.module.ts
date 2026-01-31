import { Module } from '@nestjs/common';
import { DashboardController } from '@/modules/comics/user/dashboard/controllers/dashboard.controller';
import { DashboardService } from '@/modules/comics/user/dashboard/services/dashboard.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}



