export enum OrderType {
    physical = 'physical',
    digital = 'digital',
}

/**
 * Labels cho OrderType
 */
export const OrderTypeLabels: Record<OrderType, string> = {
    [OrderType.physical]: 'Sản phẩm vật lý',
    [OrderType.digital]: 'Sản phẩm số',
};
