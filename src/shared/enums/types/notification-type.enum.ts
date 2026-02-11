export enum NotificationType {
  info = 'info',
  success = 'success',
  warning = 'warning',
  error = 'error',
  order_status = 'order_status',
  payment_status = 'payment_status',
  promotion = 'promotion',
}

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



