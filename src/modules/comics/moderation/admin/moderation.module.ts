import { Module } from '@nestjs/common';
import { ModerationController } from '@/modules/comics/admin/moderation/controllers/moderation.controller';
import { ModerationService } from '@/modules/comics/admin/moderation/services/moderation.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [ModerationController],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}



