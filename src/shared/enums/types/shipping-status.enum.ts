export enum ShippingStatus {
    pending = 'pending',
    processing = 'processing',
    shipped = 'shipped',
    delivered = 'delivered',
    returned = 'returned',
    cancelled = 'cancelled',
}

/**
 * Labels cho ShippingStatus
 */
export const ShippingStatusLabels: Record<ShippingStatus, string> = {
    [ShippingStatus.pending]: 'Chờ xử lý',
    [ShippingStatus.processing]: 'Đang xử lý',
    [ShippingStatus.shipped]: 'Đã vận chuyển',
    [ShippingStatus.delivered]: 'Đã giao hàng',
    [ShippingStatus.returned]: 'Đã trả hàng',
    [ShippingStatus.cancelled]: 'Đã hủy',
};
