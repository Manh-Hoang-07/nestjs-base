import { Module } from '@nestjs/common';
import { NotificationService } from '@/modules/core/notification/admin/services/notification.service';
import { NotificationController as AdminNotificationController } from '@/modules/core/notification/admin/controllers/notification.controller';
import { NotificationController as UserNotificationController } from '@/modules/core/notification/user/controllers/notification.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

// Import repository module
import { NotificationRepositoryModule } from '@/modules/core/notification/notification.repository.module';

@Module({
  imports: [
    RbacModule,
    NotificationRepositoryModule,
  ],
  controllers: [AdminNotificationController, UserNotificationController],
  providers: [NotificationService],
  exports: [NotificationService, NotificationRepositoryModule],
})
export class NotificationModule { }
