import { Module } from '@nestjs/common';
import { PublicComicsController } from './controllers/comic.controller';
import { PublicComicsService } from './services/comic.service';
import { UserFollowsModule } from '@/modules/comics/follow/user/follow.module';
import { ComicRepositoryModule } from '../comic.repository.module';
import { FollowRepositoryModule } from '@/modules/comics/follow/follow.repository.module';

@Module({
  imports: [
    UserFollowsModule,
    ComicRepositoryModule,
    FollowRepositoryModule,
  ],
  controllers: [PublicComicsController],
  providers: [PublicComicsService],
  exports: [PublicComicsService],
})
export class PublicComicsModule { }

