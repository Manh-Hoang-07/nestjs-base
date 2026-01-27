import { ProductStatus } from '@prisma/client';

/**
 * Product Status Enum
 * Import từ Prisma
 */
export { ProductStatus };

export const ProductStatusLabels: Record<ProductStatus, string> = {
    [ProductStatus.active]: 'Đang bán',
    [ProductStatus.inactive]: 'Ngừng bán',
    [ProductStatus.draft]: 'Nháp',
    [ProductStatus.archived]: 'Lưu trữ',
};
