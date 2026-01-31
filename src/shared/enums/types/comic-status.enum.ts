import { ComicStatus } from '@prisma/client';

/**
 * Comic Status Enum
 * Import từ Prisma
 */
export { ComicStatus };

/**
 * Labels cho ComicStatus
 */
export const ComicStatusLabels: Record<ComicStatus, string> = {
    [ComicStatus.draft]: 'Nháp',
    [ComicStatus.published]: 'Đã xuất bản',
    [ComicStatus.completed]: 'Hoàn thành',
    [ComicStatus.hidden]: 'Ẩn',
};

/**
 * Các trạng thái truyện có thể hiển thị công khai
 */
export const PUBLIC_COMIC_STATUSES = [
    ComicStatus.published,
    ComicStatus.completed,
];

/**
 * Các trạng thái truyện quản trị có thể thao tác
 */
export const MANAGEABLE_COMIC_STATUSES = [
    ComicStatus.draft,
    ComicStatus.published,
    ComicStatus.completed,
    ComicStatus.hidden,
];



