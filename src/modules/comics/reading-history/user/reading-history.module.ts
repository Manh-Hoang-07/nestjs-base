import { Module } from '@nestjs/common';
import { ReadingHistoryController } from '@/modules/comics/user/reading-history/controllers/reading-history.controller';
import { ReadingHistoryService } from '@/modules/comics/user/reading-history/services/reading-history.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [ReadingHistoryController],
  providers: [ReadingHistoryService],
  exports: [ReadingHistoryService],
})
export class UserReadingHistoryModule {}



