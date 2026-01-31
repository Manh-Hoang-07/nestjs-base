import { Module } from '@nestjs/common';
import { HomepageController } from './controllers/homepage.controller';
import { HomepageService } from './services/homepage.service';
import { PublicComicsModule } from '../../comic/public/comic.module';
import { PublicChaptersModule } from '../../chapter/public/chapter.module';
import { PublicComicCategoriesModule } from '../../comic-category/public/comic-category.module';

@Module({
  imports: [
    PublicComicsModule,
    PublicChaptersModule,
    PublicComicCategoriesModule,
  ],
  controllers: [HomepageController],
  providers: [HomepageService],
  exports: [HomepageService],
})
export class HomepageModule {}

