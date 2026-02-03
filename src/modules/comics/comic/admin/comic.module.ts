import { Module } from '@nestjs/common';
import { ComicController } from './controllers/comic.controller';
import { ComicService } from './services/comic.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { FileUploadModule } from '@/modules/storage/file-upload/file-upload.module';
import { ComicRepositoryModule } from '../comic.repository.module';
import { StatsRepositoryModule } from '../../stats/stats.repository.module';

@Module({
  imports: [
    RbacModule,
    FileUploadModule,
    ComicRepositoryModule,
    StatsRepositoryModule,
  ],
  controllers: [ComicController],
  providers: [ComicService],
  exports: [ComicService],
})
export class AdminComicModule { }

