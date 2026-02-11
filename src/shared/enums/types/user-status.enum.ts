export enum UserStatus {
  active = 'active',
  pending = 'pending',
  inactive = 'inactive',
}

/**
 * Labels cho UserStatus
 */
export const UserStatusLabels: Record<UserStatus, string> = {
  [UserStatus.active]: 'Hoạt động',
  [UserStatus.pending]: 'Chờ xác nhận',
  [UserStatus.inactive]: 'Đã khóa',
};





