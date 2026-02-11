export enum PaymentType {
    online = 'online',
    offline = 'offline',
}

/**
 * Labels cho PaymentType
 */
export const PaymentTypeLabels: Record<PaymentType, string> = {
    [PaymentType.online]: 'Thanh toán Online',
    [PaymentType.offline]: 'Thanh toán Offline',
};


