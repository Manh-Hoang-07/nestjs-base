import { Module } from '@nestjs/common';
import { StatsController } from './controllers/stats.controller';
import { StatsService } from './services/stats.service';
import { ComicRepositoryModule } from '../../comic/comic.repository.module';
import { StatsRepositoryModule } from '../stats.repository.module';

@Module({
  imports: [
    ComicRepositoryModule,
    StatsRepositoryModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class PublicStatsModule { }



