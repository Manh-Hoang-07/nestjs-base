import { Module } from '@nestjs/common';
import { PublicCommentsController } from '@/modules/comics/public/comments/controllers/comments.controller';
import { PublicCommentsService } from '@/modules/comics/public/comments/services/comments.service';

@Module({
  imports: [],
  controllers: [PublicCommentsController],
  providers: [PublicCommentsService],
  exports: [PublicCommentsService],
})
export class PublicCommentsModule {}
