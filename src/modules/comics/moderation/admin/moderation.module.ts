import { Module } from '@nestjs/common';
import { ModerationController } from './controllers/moderation.controller';
import { ModerationService } from './services/moderation.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [ModerationController],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}



