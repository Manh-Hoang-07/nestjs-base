import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INotificationRepository, NOTIFICATION_REPOSITORY, NotificationFilter } from '@/modules/core/notification/domain/notification.repository';
import { BaseService } from '@/common/core/services';

@Injectable()
export class NotificationService extends BaseService<any, INotificationRepository> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationRepository,
  ) {
    super(notificationRepo);
  }

  async getList(query: any) {
    const filter: NotificationFilter = {};
    if (query.search) filter.search = query.search;
    if (query.userId) filter.userId = query.userId;
    if (query.isRead !== undefined) filter.isRead = query.isRead;
    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;

    return super.getList({
      page: query.page,
      limit: query.limit,
      sort: query.sort || 'created_at:desc',
      filter,
    });
  }

  async getSimpleList(query: any) {
    return this.getList({
      ...query,
      limit: query.limit ?? 50,
    });
  }

  protected async beforeCreate(data: any) {
    if (data.user_id) data.user_id = BigInt(data.user_id);
    return data;
  }

  protected async beforeUpdate(id: number | bigint, data: any) {
    if (data.user_id) data.user_id = BigInt(data.user_id);
    return data;
  }

  async restore(id: number) {
    return this.notificationRepo.update(id, { deleted_at: null } as any);
  }

  async markAsReadForUser(id: number, userId: number) {
    const notification = await this.getOne(id);
    if (!notification || Number((notification as any).user_id) !== userId) {
      throw new NotFoundException('Notification not found');
    }
    const updated = await this.notificationRepo.markAsRead(id);
    return this.transform(updated);
  }

  async markAllAsReadForUser(userId: number) {
    await this.notificationRepo.markAllAsRead(userId);
  }
}
