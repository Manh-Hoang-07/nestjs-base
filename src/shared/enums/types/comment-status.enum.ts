import { CommentStatus } from '@prisma/client';

/**
 * Comment Status Enum
 * Import từ Prisma
 */
export { CommentStatus };

/**
 * Labels cho CommentStatus
 */
export const CommentStatusLabels: Record<CommentStatus, string> = {
  [CommentStatus.visible]: 'Hiển thị',
  [CommentStatus.hidden]: 'Ẩn',
};

/**
 * Các trạng thái comment có thể hiển thị công khai
 */
export const PUBLIC_COMMENT_STATUSES = [
  CommentStatus.visible,
];

