import { Module } from '@nestjs/common';
import { HomepageController } from '@/modules/comics/public/homepage/controllers/homepage.controller';
import { HomepageService } from '@/modules/comics/public/homepage/services/homepage.service';
import { PublicComicsModule } from '@/modules/comics/public/comics/comics.module';
import { PublicChaptersModule } from '@/modules/comics/public/chapters/chapters.module';
import { PublicComicCategoriesModule } from '@/modules/comics/public/comic-categories/comic-categories.module';

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

