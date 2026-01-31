import { Module } from '@nestjs/common';
import { PublicComicCategoriesController } from './controllers/comic-category.controller';
import { PublicComicCategoriesService } from './services/comic-category.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ComicCategoryRepositoryModule } from '../comic-category.repository.module';

@Module({
  imports: [RbacModule, ComicCategoryRepositoryModule],
  controllers: [PublicComicCategoriesController],
  providers: [PublicComicCategoriesService],
  exports: [PublicComicCategoriesService],
})
export class PublicComicCategoriesModule { }

