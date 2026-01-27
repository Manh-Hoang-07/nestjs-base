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
