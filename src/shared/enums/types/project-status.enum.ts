import { ProjectStatus } from '@prisma/client';

/**
 * Project Status Enum
 * Import từ Prisma
 */
export { ProjectStatus };

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.planning]: 'Đang lên kế hoạch',
  [ProjectStatus.in_progress]: 'Đang thực hiện',
  [ProjectStatus.completed]: 'Hoàn thành',
  [ProjectStatus.cancelled]: 'Đã hủy',
};

