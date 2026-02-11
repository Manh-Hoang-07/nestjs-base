export enum ProjectStatus {
  planning = 'planning',
  in_progress = 'in_progress',
  completed = 'completed',
  cancelled = 'cancelled',
}

/**
 * Labels cho ProjectStatus
 */
export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.planning]: 'Đang lên kế hoạch',
  [ProjectStatus.in_progress]: 'Đang thực hiện',
  [ProjectStatus.completed]: 'Hoàn thành',
  [ProjectStatus.cancelled]: 'Đã hủy',
};



