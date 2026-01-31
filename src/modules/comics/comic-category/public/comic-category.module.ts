import { Module } from '@nestjs/common';
import { PublicComicCategoriesController } from '@/modules/comics/public/comic-categories/controllers/comic-categories.controller';
import { PublicComicCategoriesService } from '@/modules/comics/public/comic-categories/services/comic-categories.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [RbacModule],
  controllers: [PublicComicCategoriesController],
  providers: [PublicComicCategoriesService],
  exports: [PublicComicCategoriesService],
})
export class PublicComicCategoriesModule { }

