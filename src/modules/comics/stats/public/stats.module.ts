import { Module } from '@nestjs/common';
import { StatsController } from '@/modules/comics/public/stats/controllers/stats.controller';
import { StatsService } from '@/modules/comics/public/stats/services/stats.service';

@Module({
  imports: [],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}



