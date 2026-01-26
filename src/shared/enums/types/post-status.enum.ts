import { PostStatus } from '@prisma/client';

/**
 * Post Status Enum
 * Import từ Prisma
 */
export { PostStatus };

/**
 * Labels cho PostStatus
 */
export const PostStatusLabels: Record<PostStatus, string> = {
    [PostStatus.draft]: 'Nháp',
    [PostStatus.scheduled]: 'Đã lên lịch',
    [PostStatus.published]: 'Đã xuất bản',
    [PostStatus.archived]: 'Lưu trữ',
};

/**
 * Các trạng thái bài viết có thể hiển thị công khai
 */
export const PUBLIC_POST_STATUSES = [
    PostStatus.published,
];

/**
 * Các trạng thái bài viết quản trị có thể thao tác
 */
export const MANAGEABLE_POST_STATUSES = [
    PostStatus.draft,
    PostStatus.scheduled,
    PostStatus.published,
    PostStatus.archived,
];






