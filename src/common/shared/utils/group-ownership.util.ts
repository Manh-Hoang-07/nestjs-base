import { ForbiddenException } from '@nestjs/common';
import { RequestContext } from '@/common/shared/utils';

/**
 * Interface cho entity có group_id
 */
export interface GroupOwnedEntity {
  group_id?: number | bigint | null;
}

/**
 * Verify ownership: kiểm tra entity có thuộc về group hiện tại không
 * 
 * @param entity - Entity có group_id (Product, Order, Post, Coupon, Warehouse, ...)
 * @throws ForbiddenException nếu không có quyền truy cập
 * 
 * @example
 * ```typescript
 * verifyGroupOwnership(product);
 * verifyGroupOwnership(order);
 * ```
 */
export function verifyGroupOwnership(entity: GroupOwnedEntity): void {
  const groupId = RequestContext.get<number | null>('groupId');
  const contextId = RequestContext.get<number>('contextId');

  // System context (id=1) hoặc không có groupId → có thể truy cập tất cả entities
  if (contextId === 1 || !groupId) {
    return;
  }

  // Group khác: chỉ được truy cập entities có group_id = groupId hiện tại
  if (entity.group_id !== null && entity.group_id !== undefined) {
    // Convert to Number for comparison to handle bigint
    const entityGroupId = typeof entity.group_id === 'bigint' ? Number(entity.group_id) : entity.group_id;
    if (entityGroupId !== groupId) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập bản ghi này. Bản ghi thuộc về group khác.'
      );
    }
  } else {
    // Entity không có group_id (global) → chỉ system group mới được truy cập
    throw new ForbiddenException(
      'Bạn không có quyền truy cập bản ghi này. Bản ghi này thuộc về system group.'
    );
  }
}

/**
 * @deprecated Use verifyGroupOwnership instead
 * Verify ownership: kiểm tra entity có thuộc về group hiện tại không
 */
export function verifyContextOwnership(entity: GroupOwnedEntity): void {
  verifyGroupOwnership(entity);
}

/**
 * Helper to get group filter based on context
 * 
 * Nếu là system context (quản trị toàn hệ thống) thì không lọc theo group_id (trả về {})
 * Nếu là group khác thì trả về { group_id: groupId }
 */
export function getGroupFilter(): { group_id?: number | bigint } {
  const context = RequestContext.get<any>('context');
  const contextId = RequestContext.get<number>('contextId');
  const groupId = RequestContext.get<number | null>('groupId');

  // Nếu là system context (quản trị toàn hệ thống) thì không lọc theo group_id
  if (context?.type === 'system' || contextId === 1) {
    return {};
  }

  return groupId ? { group_id: groupId } : {};
}
/**
 * Tự động gán group_id cho payload dựa trên context hiện tại.
 * Nếu là system context (quản tài hệ thống) -> group_id = null.
 * Nếu là group context -> group_id = currentGroupId.
 * 
 * @param payload - Object cần gán group_id
 */
export function assignGroupOwnership(payload: any): void {
  const context = RequestContext.get<any>('context');
  const groupId = RequestContext.get<number | null>('groupId');

  // Nếu đã có group_id trong payload (do người dùng chủ động gửi), không ghi đè
  if (payload.group_id !== undefined) {
    return;
  }

  if (context?.type === 'system') {
    payload.group_id = null;
  } else {
    payload.group_id = groupId || null;
  }
}
