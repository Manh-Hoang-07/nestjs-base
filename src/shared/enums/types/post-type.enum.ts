import { PostType } from '@prisma/client';

/**
 * Post Type Enum
 * Import từ Prisma
 */
export { PostType };

/**
 * Labels cho PostType
 */
export const PostTypeLabels: Record<PostType, string> = {
  [PostType.text]: 'Văn bản',
  [PostType.video]: 'Video',
  [PostType.image]: 'Hình ảnh',
  [PostType.audio]: 'Âm thanh',
};

/**
 * Các loại bài viết hỗ trợ media (video, image, audio)
 */
export const MEDIA_POST_TYPES = [
  PostType.video,
  PostType.image,
  PostType.audio,
];

/**
 * Các loại bài viết yêu cầu URL media
 */
export const REQUIRES_MEDIA_URL_POST_TYPES = [
  PostType.video,
  PostType.audio,
];

