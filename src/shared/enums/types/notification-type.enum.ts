import { NotificationType } from '@prisma/client';

/**
 * Notification Type Enum
 * Import từ Prisma
 */
export { NotificationType };

/**
 * Labels cho NotificationType
 */
export const NotificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.info]: 'Thông tin',
  [NotificationType.success]: 'Thành công',
  [NotificationType.warning]: 'Cảnh báo',
  [NotificationType.error]: 'Lỗi',
  [NotificationType.order_status]: 'Trạng thái đơn hàng',
  [NotificationType.payment_status]: 'Trạng thái thanh toán',
  [NotificationType.promotion]: 'Khuyến mãi',
};

