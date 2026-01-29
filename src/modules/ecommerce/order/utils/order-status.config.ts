export const ORDER_STATUS_CONFIG: Record<string, {
    value: string;
    label: string;
    nextStatuses: string[];
}> = {
    pending: {
        value: 'pending',
        label: 'Chờ xác nhận',
        nextStatuses: ['confirmed', 'cancelled'],
    },
    confirmed: {
        value: 'confirmed',
        label: 'Đã xác nhận',
        nextStatuses: ['processing', 'cancelled'],
    },
    processing: {
        value: 'processing',
        label: 'Đang xử lý',
        nextStatuses: ['shipped', 'cancelled'],
    },
    shipped: {
        value: 'shipped',
        label: 'Đã giao vận chuyển',
        nextStatuses: ['delivered'],
    },
    delivered: {
        value: 'delivered',
        label: 'Đã giao hàng',
        nextStatuses: [],
    },
    cancelled: {
        value: 'cancelled',
        label: 'Đã hủy',
        nextStatuses: [],
    },
};

export const PAYMENT_STATUS_CONFIG: Record<string, {
    value: string;
    label: string;
}> = {
    pending: { value: 'pending', label: 'Chờ thanh toán' },
    paid: { value: 'paid', label: 'Đã thanh toán' },
    failed: { value: 'failed', label: 'Thanh toán thất bại' },
    refunded: { value: 'refunded', label: 'Đã hoàn tiền' },
    partially_refunded: { value: 'partially_refunded', label: 'Hoàn tiền một phần' },
};

export const SHIPPING_STATUS_CONFIG: Record<string, {
    value: string;
    label: string;
}> = {
    pending: { value: 'pending', label: 'Chờ chuẩn bị' },
    preparing: { value: 'preparing', label: 'Đang chuẩn bị' },
    shipped: { value: 'shipped', label: 'Đã giao vận chuyển' },
    delivered: { value: 'delivered', label: 'Đã giao hàng' },
    returned: { value: 'returned', label: 'Đã trả hàng' },
};

export function getOrderStatusMetadata(currentStatus: string) {
    const config = ORDER_STATUS_CONFIG[currentStatus];
    if (!config) return { availableTransitions: [], allStatuses: [] };

    return {
        availableTransitions: config.nextStatuses.map((status: string) => ({
            value: ORDER_STATUS_CONFIG[status].value,
            label: ORDER_STATUS_CONFIG[status].label,
        })),
        allStatuses: Object.values(ORDER_STATUS_CONFIG).map(s => ({
            value: s.value,
            label: s.label,
        })),
    };
}

export function getPaymentStatusMetadata() {
    return {
        allStatuses: Object.values(PAYMENT_STATUS_CONFIG),
    };
}

export function getShippingStatusMetadata() {
    return {
        allStatuses: Object.values(SHIPPING_STATUS_CONFIG),
    };
}
