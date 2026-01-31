import { Module } from '@nestjs/common';
import { ReadingHistoryController } from './controllers/reading-history.controller';
import { ReadingHistoryService } from './services/reading-history.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [ReadingHistoryController],
  providers: [ReadingHistoryService],
  exports: [ReadingHistoryService],
})
export class UserReadingHistoryModule {}



