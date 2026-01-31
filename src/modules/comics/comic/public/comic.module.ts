import { Module } from '@nestjs/common';
import { PublicComicsController } from './controllers/comic.controller';
import { PublicComicsService } from './services/comic.service';
import { UserFollowsModule } from '@/modules/comics/follow/user/follow.module';
import { ComicRepositoryModule } from '../comic.repository.module';

@Module({
  imports: [UserFollowsModule, ComicRepositoryModule],
  controllers: [PublicComicsController],
  providers: [PublicComicsService],
  exports: [PublicComicsService],
})
export class PublicComicsModule { }

