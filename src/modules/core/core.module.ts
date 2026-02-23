import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RbacModule } from './rbac/rbac.module';
import { ContextModule } from './context/context.module';
import { NotificationModule } from './notification/notification.module';
import { IamModule } from './iam/iam.module';
import { MenuModule } from './menu/menu.module';
import { SystemConfigModule } from './system-config/system-config.module';
import { ContentTemplateModule } from './content-template/content-template.module';
import { QueueWorkerModule } from './queue/queue.module';
import { LocationModule } from './location/location.module';

@Module({
    imports: [
        AuthModule,
        RbacModule,
        ContextModule,
        NotificationModule,
        IamModule,
        MenuModule,
        SystemConfigModule,
        ContentTemplateModule,
        QueueWorkerModule,
        LocationModule,
    ],
    exports: [
        AuthModule,
        RbacModule,
        ContextModule,
        NotificationModule,
        IamModule,
        MenuModule,
        SystemConfigModule,
        ContentTemplateModule,
        QueueWorkerModule,
        LocationModule,
    ],
})
export class CoreModulesModule { }
