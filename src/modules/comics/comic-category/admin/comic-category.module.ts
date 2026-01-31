import { Module } from '@nestjs/common';
import { ComicCategoryController } from './controllers/comic-category.controller';
import { ComicCategoryService } from './services/comic-category.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ComicCategoryRepositoryModule } from '../comic-category.repository.module';

@Module({
  imports: [
    RbacModule,
    ComicCategoryRepositoryModule,
  ],
  controllers: [ComicCategoryController],
  providers: [ComicCategoryService],
  exports: [ComicCategoryService],
})
export class AdminComicCategoryModule { }
