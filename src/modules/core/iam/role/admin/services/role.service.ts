import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { RbacCacheService } from '@/modules/core/rbac/services/rbac-cache.service';
import { RequestContext } from '@/common/shared/utils';
import { IRoleRepository, ROLE_REPOSITORY, RoleFilter } from '@/modules/core/iam/role/domain/role.repository';
import { IPermissionRepository, PERMISSION_REPOSITORY } from '@/modules/core/iam/permission/domain/permission.repository';
import { IUserRoleAssignmentRepository, USER_ROLE_ASSIGNMENT_REPOSITORY } from '@/modules/core/rbac/user-role-assignment/domain/user-role-assignment.repository';
import { BaseService } from '@/common/core/services';

@Injectable()
export class RoleService extends BaseService<any, IRoleRepository> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepo: IRoleRepository,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepo: IPermissionRepository,
    @Inject(USER_ROLE_ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepo: IUserRoleAssignmentRepository,
    private readonly rbacCache: RbacCacheService,
  ) {
    super(roleRepo);
  }

  private pendingContextIds: number[] | null = null;

  protected async prepareFilters(filter: any) {
    const context = RequestContext.get<any>('context');
    const contextId = RequestContext.get<number>('contextId') || 1;

    // Nếu không phải system context, filter theo contextId
    if (context && context.type !== 'system') {
      return { ...filter, contextId };
    }

    return filter;
  }



  async getSimpleList(query: any) {
    return this.getList({ ...query, limit: 1000 });
  }

  /**
   * Alias with audit log support
   */
  async createWithAudit(data: any, createdBy?: number) {
    if (createdBy) {
      data.created_user_id = createdBy;
      data.updated_user_id = createdBy;
    }
    return this.create(data);
  }

  /**
   * Alias with audit log support
   */
  async updateWithAudit(id: number, data: any, updatedBy?: number) {
    if (updatedBy) data.updated_user_id = updatedBy;
    return this.update(id, data);
  }

  /**
   * Alias for update
   */
  async updateById(id: number, data: any) {
    return this.update(id, data);
  }

  /**
   * Alias for delete
   */
  async deleteById(id: number) {
    return this.delete(id);
  }

  protected async beforeCreate(data: any) {
    const payload = this.preparePayload(data);

    if (payload.code) {
      const exists = await this.roleRepo.findByCode(payload.code);
      if (exists) throw new BadRequestException('Role code already exists');
    }

    this.pendingContextIds = this.normalizeIdArray(payload.context_ids);
    delete payload.context_ids;

    return payload;
  }

  protected async afterCreate(role: any) {
    if (this.pendingContextIds) {
      await this.roleRepo.syncContexts(role.id, this.pendingContextIds);
      this.pendingContextIds = null;
    }
  }

  protected async beforeUpdate(id: number | bigint, data: any) {
    const current = await this.roleRepo.findById(id);
    if (!current) throw new NotFoundException('Role not found');

    const payload = this.preparePayload(data);

    if (payload.code && payload.code !== current.code) {
      const exists = await this.roleRepo.findByCode(payload.code);
      if (exists) throw new BadRequestException('Role code already exists');
    }

    this.pendingContextIds = this.normalizeIdArray(payload.context_ids);
    delete payload.context_ids;

    return payload;
  }

  protected async afterUpdate(id: number | bigint) {
    if (this.pendingContextIds !== null) {
      await this.roleRepo.syncContexts(id, this.pendingContextIds);
      this.pendingContextIds = null;
    }
  }

  protected async beforeDelete(id: number | bigint): Promise<boolean> {
    const childrenCount = await this.roleRepo.count({ parent_id: BigInt(id), deleted_at: null });
    if (childrenCount > 0) throw new BadRequestException('Cannot delete role with children');

    const userCount = await this.assignmentRepo.count({ role_id: BigInt(id) });
    if (userCount > 0) throw new BadRequestException('Cannot delete role assigned to users');

    return true;
  }

  async assignPermissions(roleId: number, permissionIds: number[]) {
    const role = await this.getOne(roleId);
    if (!role) throw new NotFoundException('Role not found');

    await this.roleRepo.syncPermissions(roleId, permissionIds);

    if (this.rbacCache && typeof this.rbacCache.bumpVersion === 'function') {
      await this.rbacCache.bumpVersion().catch(() => undefined);
    }

    return this.getOne(roleId);
  }

  private preparePayload(data: any): any {
    const payload = { ...data };
    if (payload.created_user_id) payload.created_user_id = BigInt(payload.created_user_id);
    if (payload.updated_user_id) payload.updated_user_id = BigInt(payload.updated_user_id);
    if (payload.parent_id) payload.parent_id = BigInt(payload.parent_id);
    return payload;
  }

  private normalizeIdArray(input: any): number[] | null {
    if (input === undefined) return null;
    if (!Array.isArray(input)) return [];
    return input.map((id: any) => Number(id)).filter((id) => !Number.isNaN(id));
  }

  protected transform(role: any) {
    if (!role) return role;
    const item = super.transform(role) as any;

    if (item.parent) {
      const { id, code, name, status } = item.parent;
      item.parent = { id, code, name, status };
    }

    if (item.children) {
      item.children = item.children.map((child: any) => {
        const { id, code, name, status } = child;
        return { id, code, name, status };
      });
    }

    if (item.permissions) {
      item.permissions = (item.permissions as any[])
        .map((link) => link.permission)
        .filter(Boolean)
        .map((perm: any) => {
          const { id, code, name, status } = perm;
          return { id, code, name, status };
        });
    }

    if (item.role_contexts) {
      const contextId = RequestContext.get<number>('contextId') || 1;
      const context = RequestContext.get<any>('context');
      let filtered = item.role_contexts as any[];
      if (context && context.type !== 'system') {
        filtered = filtered.filter((rc) => Number(rc.context_id) === contextId);
      }

      item.context_ids = filtered.map((rc) => Number(rc.context_id));
      item.contexts = filtered
        .filter((rc) => rc.context)
        .map((rc) => {
          const ctx = rc.context;
          return {
            id: Number(ctx.id),
            type: ctx.type,
            name: ctx.name,
            status: ctx.status,
            ref_id: ctx.ref_id ? Number(ctx.ref_id) : null,
          };
        });
      delete item.role_contexts;
    } else {
      item.context_ids = [];
      item.contexts = [];
    }

    return item;
  }
}
