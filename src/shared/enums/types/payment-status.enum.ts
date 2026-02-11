export enum PaymentStatus {
    pending = 'pending',
    processing = 'processing',
    completed = 'completed',
    failed = 'failed',
    refunded = 'refunded',
}

/**
 * Labels cho PaymentStatus
 */
export const PaymentStatusLabels: Record<PaymentStatus, string> = {
    [PaymentStatus.pending]: 'Chờ thanh toán',
    [PaymentStatus.processing]: 'Đang xử lý',
    [PaymentStatus.completed]: 'Đã thanh toán',
    [PaymentStatus.failed]: 'Thanh toán thất bại',
    [PaymentStatus.refunded]: 'Đã hoàn tiền',
};
