import { PaymentType } from '@prisma/client';

export { PaymentType };

export const PaymentTypeLabels: Record<PaymentType, string> = {
    [PaymentType.online]: 'Thanh toán Online',
    [PaymentType.offline]: 'Thanh toán Offline',
};
