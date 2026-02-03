import { Module } from '@nestjs/common';
import { AdminStatsController } from './controllers/admin-stats.controller';
import { AdminStatsService } from './services/admin-stats.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ComicRepositoryModule } from '../../comic/comic.repository.module';
import { StatsRepositoryModule } from '../stats.repository.module';

@Module({
  imports: [
    RbacModule,
    ComicRepositoryModule,
    StatsRepositoryModule,
  ],
  controllers: [AdminStatsController],
  providers: [AdminStatsService],
  exports: [AdminStatsService],
})
export class AdminStatsModule { }



