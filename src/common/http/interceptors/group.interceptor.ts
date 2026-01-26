import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RequestContext } from '@/common/shared/utils';
import { AdminContextService } from '@/modules/core/context/context/admin/services/context.service';
import { AdminGroupService } from '@/modules/core/context/group/admin/services/group.service';
import { UserGroupService } from '@/modules/core/context/group/user/services/group.service';
import { Auth } from '@/common/auth/utils';
import { PERMS_REQUIRED_KEY, PUBLIC_PERMISSION } from '@/common/auth/decorators';

@Injectable()
export class GroupInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly contextService: AdminContextService,
    private readonly groupService: AdminGroupService,
    private readonly userGroupService: UserGroupService,
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // Check if this is a public endpoint
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(PERMS_REQUIRED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || [];
    const isPublicEndpoint = requiredPerms.includes(PUBLIC_PERMISSION);

    // ✅ Chỉ dùng group_id, không cần context_id
    const groupIdFromHeader = request.headers['x-group-id'];
    const groupIdFromQuery = (request.query as any)?.group_id;

    if (groupIdFromHeader || groupIdFromQuery) {
      // Nếu có group_id trong request
      const groupId = Number(groupIdFromHeader || groupIdFromQuery);
      const group = await this.groupService.findById(groupId);

      if (!group) {
        // ✅ Nếu là public endpoint, không quăng lỗi nếu group không tồn tại
        // Fallback về behavior mặc định (system context)
        if (isPublicEndpoint) {
          RequestContext.set('contextId', 1);
          RequestContext.set('groupId', null);
          return next.handle();
        }
        throw new BadRequestException('Group not found');
      }

      // Validate user có quyền truy cập group này không
      // ⚠️ Skip permission check cho public endpoints
      const userId = Auth.id(context);
      if (userId && !isPublicEndpoint) {
        const userGroups = await this.userGroupService.getUserGroups(userId);
        const groupIdNumber = Number(group.id); // Convert BigInt to number for comparison
        const hasAccess = userGroups.some((g: any) => g.id === groupIdNumber);

        if (!hasAccess) {
          throw new ForbiddenException(
            `Access denied to group ${groupIdNumber}. You do not have permission to access this group.`
          );
        }
      }

      // Set group và context từ group
      RequestContext.set('groupId', group.id);
      if (group.context) {
        RequestContext.set('context', group.context);
        RequestContext.set('contextId', Number(group.context.id));
      } else {
        // Load context nếu chưa có
        const contextEntity = await this.contextService.findById(Number(group.context_id));
        if (contextEntity) {
          RequestContext.set('context', contextEntity);
          RequestContext.set('contextId', Number(contextEntity.id));
        }
      }
    } else {
      // Không có group_id → tự động resolve group từ user's groups
      const userId = Auth.id(context);

      if (userId) {
        // Lấy groups mà user là member
        const userGroups = await this.userGroupService.getUserGroups(userId);

        if (userGroups.length > 0) {
          // Ưu tiên group không phải system (ví dụ shop) hơn system group
          let selectedGroup = userGroups.find((g: any) => g.type !== 'system') || userGroups[0];

          if (selectedGroup) {
            RequestContext.set('groupId', selectedGroup.id);

            // Load context từ group
            const group = await this.groupService.findById(selectedGroup.id);
            if (group && group.context) {
              RequestContext.set('context', group.context);
              RequestContext.set('contextId', group.context.id);
            } else if (selectedGroup.context?.id) {
              const contextEntity = await this.contextService.findById(Number(selectedGroup.context.id));
              if (contextEntity) {
                RequestContext.set('context', contextEntity);
                RequestContext.set('contextId', contextEntity.id);
              }
            }
          } else {
            // Fallback: system group
            const systemGroup = await this.groupService.findByCode('system');
            if (systemGroup) {
              RequestContext.set('groupId', systemGroup.id);
              const systemContext = await this.contextService.findById(1);
              if (systemContext) {
                RequestContext.set('context', systemContext);
                RequestContext.set('contextId', 1);
              }
            } else {
              RequestContext.set('contextId', 1);
              RequestContext.set('groupId', null);
            }
          }
        } else {
          // User không có group nào → dùng system context
          RequestContext.set('contextId', 1);
          RequestContext.set('groupId', null);
        }
      } else {
        // Chưa authenticated → dùng system context
        RequestContext.set('contextId', 1);
        RequestContext.set('groupId', null);
      }
    }

    return next.handle();
  }
}

