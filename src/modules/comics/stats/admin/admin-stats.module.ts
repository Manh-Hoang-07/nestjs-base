import { Module } from '@nestjs/common';
import { AdminStatsController } from './controllers/admin-stats.controller';
import { AdminStatsService } from './services/admin-stats.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [AdminStatsController],
  providers: [AdminStatsService],
  exports: [AdminStatsService],
})
export class AdminStatsModule { }



