export enum ProductStatus {
    active = 'active',
    inactive = 'inactive',
    draft = 'draft',
    archived = 'archived',
}

/**
 * Labels cho ProductStatus
 */
export const ProductStatusLabels: Record<ProductStatus, string> = {
    [ProductStatus.active]: 'Đang bán',
    [ProductStatus.inactive]: 'Ngừng bán',
    [ProductStatus.draft]: 'Nháp',
    [ProductStatus.archived]: 'Lưu trữ',
};


