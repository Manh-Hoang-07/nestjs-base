import { UserStatus } from '@prisma/client';

/**
 * User Status Enum
 * Import từ Prisma
 */
export { UserStatus };

export const UserStatusLabels: Record<UserStatus, string> = {
  [UserStatus.active]: 'Hoạt động',
  [UserStatus.pending]: 'Chờ xác nhận',
  [UserStatus.inactive]: 'Đã khóa',
};



