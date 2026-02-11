export enum OrderStatus {
    pending = 'pending',
    confirmed = 'confirmed',
    processing = 'processing',
    shipped = 'shipped',
    delivered = 'delivered',
    cancelled = 'cancelled',
    refunded = 'refunded',
}

/**
 * Labels cho OrderStatus
 */
export const OrderStatusLabels: Record<OrderStatus, string> = {
    [OrderStatus.pending]: 'Chờ xác nhận',
    [OrderStatus.confirmed]: 'Đã xác nhận',
    [OrderStatus.processing]: 'Đang xử lý',
    [OrderStatus.shipped]: 'Đã giao vận chuyển',
    [OrderStatus.delivered]: 'Đã giao hàng',
    [OrderStatus.cancelled]: 'Đã hủy',
    [OrderStatus.refunded]: 'Đã hoàn tiền',
};
