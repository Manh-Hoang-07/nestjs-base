
import { Injectable } from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { INotificationRepository, NotificationFilter } from '../../domain/notification.repository';

@Injectable()
export class NotificationRepositoryImpl extends PrismaRepository<
    Notification,
    Prisma.NotificationWhereInput,
    Prisma.NotificationCreateInput,
    Prisma.NotificationUpdateInput,
    Prisma.NotificationOrderByWithRelationInput
> implements INotificationRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.notification as unknown as any, 'created_at:desc');
    }

    protected buildWhere(filter: NotificationFilter): Prisma.NotificationWhereInput {
        const where: Prisma.NotificationWhereInput = {};

        if (filter.search) {
            where.OR = [
                { title: { contains: filter.search } },
                { message: { contains: filter.search } },
            ];
        }

        if (filter.userId) {
            where.user_id = BigInt(filter.userId);
        }

        if (filter.isRead !== undefined) {
            where.is_read = filter.isRead;
        }

        if (filter.type) {
            where.type = filter.type as any;
        }

        if (filter.status) {
            where.status = filter.status as any;
        }

        return where;
    }

    async markAsRead(id: number | bigint): Promise<Notification> {
        return this.update(id, {
            is_read: true,
            read_at: new Date(),
        });
    }

    async markAllAsRead(userId: number | bigint): Promise<void> {
        await this.updateMany({ userId, isRead: false }, {
            is_read: true,
            read_at: new Date(),
        });
    }
}
