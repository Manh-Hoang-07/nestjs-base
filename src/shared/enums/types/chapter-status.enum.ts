import { ChapterStatus } from '@prisma/client';

/**
 * Chapter Status Enum
 * Import từ Prisma
 */
export { ChapterStatus };

/**
 * Labels cho ChapterStatus
 */
export const ChapterStatusLabels: Record<ChapterStatus, string> = {
    [ChapterStatus.draft]: 'Nháp',
    [ChapterStatus.published]: 'Đã xuất bản',
};

/**
 * Các trạng thái chương có thể hiển thị công khai
 */
export const PUBLIC_CHAPTER_STATUSES = [
    ChapterStatus.published,
];

/**
 * Các trạng thái chương quản trị có thể thao tác
 */
export const MANAGEABLE_CHAPTER_STATUSES = [
    ChapterStatus.draft,
    ChapterStatus.published,
];



