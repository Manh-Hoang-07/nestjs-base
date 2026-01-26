import { Global, Module } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY } from './domain/notification.repository';
import { NotificationRepositoryImpl } from './infrastructure/repositories/notification.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: NOTIFICATION_REPOSITORY,
            useClass: NotificationRepositoryImpl,
        },
    ],
    exports: [NOTIFICATION_REPOSITORY],
})
export class NotificationRepositoryModule { }
