import { Injectable, BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { IPermissionRepository, PERMISSION_REPOSITORY, PermissionFilter } from '@/modules/core/iam/permission/domain/permission.repository';
import { RbacCacheService } from '@/modules/core/rbac/services/rbac-cache.service';
import { BaseService } from '@/common/core/services';

@Injectable()
export class PermissionService extends BaseService<any, IPermissionRepository> {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepo: IPermissionRepository,
    private readonly rbacCache: RbacCacheService,
  ) {
    super(permissionRepo);
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
   * Alias for delete
   */
  async deleteById(id: number) {
    return this.delete(id);
  }

  protected async beforeCreate(data: any) {
    const payload = this.preparePayload(data);
    if (payload.code) {
      const exists = await this.permissionRepo.findByCode(payload.code);
      if (exists) throw new BadRequestException('Permission code already exists');
    }
    return payload;
  }

  protected async beforeUpdate(id: number | bigint, data: any) {
    const current = await this.permissionRepo.findById(id);
    if (!current) throw new NotFoundException('Permission not found');

    const payload = this.preparePayload(data);
    if (payload.code && payload.code !== current.code) {
      const exists = await this.permissionRepo.findByCode(payload.code);
      if (exists) throw new BadRequestException('Permission code already exists');
    }
    return payload;
  }

  protected async afterUpdate() {
    await this.rbacCache.bumpVersion().catch(() => undefined);
  }

  protected async beforeDelete(id: number | bigint): Promise<boolean> {
    const childrenCount = await this.permissionRepo.count({ parent_id: BigInt(id), deleted_at: null });
    if (childrenCount > 0) throw new BadRequestException('Cannot delete permission with children');
    return true;
  }

  protected async afterDelete() {
    await this.rbacCache.bumpVersion().catch(() => undefined);
  }

  private preparePayload(data: any) {
    const payload = { ...data };
    if (payload.parent_id) payload.parent_id = BigInt(payload.parent_id);
    if (payload.created_user_id) payload.created_user_id = BigInt(payload.created_user_id);
    if (payload.updated_user_id) payload.updated_user_id = BigInt(payload.updated_user_id);
    return payload;
  }

  protected transform(permission: any) {
    if (!permission) return permission;
    const item = super.transform(permission) as any;
    if (item.parent) {
      const { id, code, name, status } = item.parent;
      item.parent = { id, code, name, status };
    }
    if (item.children) {
      item.children = (item.children as any[]).map((child) => {
        const { id, code, name, status } = child;
        return { id, code, name, status };
      });
    }
    return item;
  }
}
