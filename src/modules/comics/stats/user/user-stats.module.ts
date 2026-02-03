import { Module } from '@nestjs/common';
import { UserStatsController } from './controllers/user-stats.controller';
import { UserStatsService } from './services/user-stats.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [UserStatsController],
  providers: [UserStatsService],
  exports: [UserStatsService],
})
export class UserStatsModule { }



