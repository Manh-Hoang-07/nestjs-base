
import { Notification } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const NOTIFICATION_REPOSITORY = 'INotificationRepository';

export interface NotificationFilter {
    search?: string;
    userId?: number;
    isRead?: boolean;
    type?: string;
    status?: string;
}

export interface INotificationRepository extends IRepository<Notification> {
    markAsRead(id: number): Promise<Notification>;
    markAllAsRead(userId: number): Promise<void>;
}
