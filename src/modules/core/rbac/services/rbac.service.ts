import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { RbacCacheService } from '@/modules/core/rbac/services/rbac-cache.service';
import { IUserGroupRepository, USER_GROUP_REPOSITORY } from '@/modules/core/rbac/user-group/domain/user-group.repository';
import { IUserRoleAssignmentRepository, USER_ROLE_ASSIGNMENT_REPOSITORY } from '@/modules/core/rbac/user-role-assignment/domain/user-role-assignment.repository';
import { IRoleHasPermissionRepository, ROLE_HAS_PERMISSION_REPOSITORY } from '@/modules/core/rbac/role-has-permission/domain/role-has-permission.repository';
import { IRoleContextRepository, ROLE_CONTEXT_REPOSITORY } from '@/modules/core/rbac/role-context/domain/role-context.repository';
import { IGroupRepository, GROUP_REPOSITORY } from '@/modules/core/context/group/domain/group.repository';
import { IUserRepository, USER_REPOSITORY } from '@/modules/core/iam/user/domain/user.repository';
import { IRoleRepository, ROLE_REPOSITORY } from '@/modules/core/iam/role/domain/role.repository';

/**
 * Service quản lý RBAC (Role-Based Access Control)
 * Bao gồm: kiểm tra quyền/vai trò của user và quản lý roles cho user
 */
@Injectable()
export class RbacService {
  constructor(
    @Inject(USER_GROUP_REPOSITORY)
    private readonly userGroupRepo: IUserGroupRepository,
    @Inject(USER_ROLE_ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepo: IUserRoleAssignmentRepository,
    @Inject(ROLE_HAS_PERMISSION_REPOSITORY)
    private readonly roleHasPermRepo: IRoleHasPermissionRepository,
    @Inject(ROLE_CONTEXT_REPOSITORY)
    private readonly roleContextRepo: IRoleContextRepository,
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepo: IGroupRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepo: IRoleRepository,
    private readonly rbacCache: RbacCacheService,
  ) { }


  /**
   * Kiểm tra user có permissions trong group cụ thể
   * @param userId - ID của user
   * @param groupId - ID của group (có thể null cho system-level)
   * @param required - Mảng permissions cần check (OR logic)
   */
  async userHasPermissionsInGroup(
    userId: number,
    groupId: number | null,
    required: string[],
  ): Promise<boolean> {
    // Nếu không cần quyền trong group (system-level)
    if (groupId === null) {
      // Check system-level permissions (nếu có)
      return this.checkSystemPermissions(userId, required);
    }

    // Check user thuộc group
    const userInGroup = await this.userGroupRepo.findUnique(userId, groupId);

    if (!userInGroup) {
      return false; // User không thuộc group → DENY
    }

    // Try cache first
    let cached = await this.rbacCache.getUserPermissionsInGroup(userId, groupId);
    if (!cached) {
      // Query permissions từ user_role_assignments
      const assignments = await this.assignmentRepo.findManyRaw({
        where: {
          user_id: BigInt(userId),
          group_id: BigInt(groupId),
          role: { status: 'active' as any },
        },
        select: { role_id: true },
      });

      if (!assignments.length) {
        await this.rbacCache.setUserPermissionsInGroup(userId, groupId, []);
        cached = new Set<string>();
      } else {
        const roleIds = Array.from(
          new Set(assignments.map((a: any) => a.role_id)),
        );

        const links = await this.roleHasPermRepo.findMany({
          where: {
            role_id: { in: roleIds },
            permission: { status: 'active' as any },
          },
          include: {
            permission: {
              include: { parent: true },
            },
          },
        });

        const set = new Set<string>();
        for (const link of links) {
          const perm = (link as any).permission;
          if (!perm) continue;
          if (perm.code) set.add(perm.code);
          if (perm.parent && perm.parent.code) {
            set.add(perm.parent.code);
          }
        }

        await this.rbacCache.setUserPermissionsInGroup(userId, groupId, set);
        cached = set;
      }
    }

    // OR logic: chỉ cần 1 permission
    for (const need of required) {
      if (cached.has(need)) return true;
    }

    return false;
  }

  /**
   * [C3] Check system-level permissions (khi groupId = null)
   * Đã thêm cache để tránh 4 DB queries mỗi request
   */
  private async checkSystemPermissions(
    userId: number,
    required: string[],
  ): Promise<boolean> {
    // [C3] Check cache trước
    const cached = await this.rbacCache.getSystemPermissions(userId);
    if (cached !== null) {
      for (const need of required) {
        if (cached.has(need)) return true;
      }
      return false;
    }

    // Cache miss: query DB
    const systemAdminGroup = await this.groupRepo.findFirstRaw({
      where: { code: 'system', status: 'active' as any }
    });

    if (!systemAdminGroup) {
      await this.rbacCache.setSystemPermissions(userId, []);
      return false;
    }

    // Check user thuộc system group
    const userInGroup = await this.userGroupRepo.findUnique(userId, Number(systemAdminGroup.id));

    if (!userInGroup) {
      await this.rbacCache.setSystemPermissions(userId, []);
      return false;
    }

    // Query permissions từ user_role_assignments
    const assignments = await this.assignmentRepo.findManyRaw({
      where: {
        user_id: BigInt(userId),
        group_id: systemAdminGroup.id,
        role: { status: 'active' as any },
      },
      select: { role_id: true },
    });

    if (!assignments.length) {
      await this.rbacCache.setSystemPermissions(userId, []);
      return false;
    }

    const roleIds = Array.from(
      new Set(assignments.map((a: any) => a.role_id)),
    );

    const links = await this.roleHasPermRepo.findMany({
      where: {
        role_id: { in: roleIds },
        permission: { status: 'active' as any },
      },
      include: {
        permission: {
          include: { parent: true },
        },
      },
    });

    const set = new Set<string>();
    for (const link of links) {
      const perm = (link as any).permission;
      if (!perm) continue;
      if (perm.code) set.add(perm.code);
      if (perm.parent && perm.parent.code) {
        set.add(perm.parent.code);
      }
    }

    // [C3] Lưu vào cache
    await this.rbacCache.setSystemPermissions(userId, set);

    // OR logic: chỉ cần 1 permission
    for (const need of required) {
      if (set.has(need)) return true;
    }
    return false;
  }

  /**
   * Gán role cho user trong group
   */
  async assignRoleToUser(
    userId: number,
    roleId: number,
    groupId: number,
  ): Promise<void> {
    // Validate: User phải thuộc group
    const userInGroup = await this.userGroupRepo.findUnique(userId, groupId);

    if (!userInGroup) {
      throw new BadRequestException(
        'User must be a member of the group before assigning role',
      );
    }

    // Validate: Role được phép trong context của group
    const group = await this.groupRepo.findById(groupId);

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const roleContext = await this.roleContextRepo.findFirst({
      where: {
        role_id: BigInt(roleId),
        context_id: (group as any).context_id,
      },
    });

    if (!roleContext) {
      throw new BadRequestException(
        'Role is not allowed in this context',
      );
    }

    // Check if assignment already exists
    const existing = await this.assignmentRepo.findUnique(userId, roleId, groupId);

    if (existing) {
      return; // Already assigned
    }

    // Insert
    await this.assignmentRepo.create({
      user_id: BigInt(userId),
      role_id: BigInt(roleId),
      group_id: BigInt(groupId),
    });

    // Clear cache
    await this.rbacCache.clearUserPermissionsInGroup(userId, groupId);
  }

  /**
   * Sync roles cho user trong group (thay thế toàn bộ roles hiện tại trong group)
   * @param userId - ID của user
   * @param groupId - ID của group
   * @param roleIds - Mảng role IDs cần gán cho user (nếu rỗng thì xóa hết roles)
   * @param skipValidation - Bỏ qua validation (chỉ dùng cho system admin)
   */
  async syncRolesInGroup(
    userId: number,
    groupId: number,
    roleIds: number[],
    skipValidation: boolean = false,
  ): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const group = await this.groupRepo.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    // Validate: User phải thuộc group
    const userInGroup = await this.userGroupRepo.findUnique(userId, groupId);

    if (!userInGroup) {
      throw new BadRequestException(
        'User must be a member of the group before assigning roles',
      );
    }

    // Validate và fetch roles
    let roles: any[] = [];
    if (roleIds.length > 0) {
      const roleIdsBigInt = roleIds.map((id) => BigInt(id));
      roles = await this.roleRepo.findManyRaw({
        where: { id: { in: roleIdsBigInt } },
      });

      if (roles.length !== roleIds.length) {
        throw new BadRequestException('Some role IDs are invalid');
      }

      // [C2] Validate roles bằng 1 batch query thay vì N+1 loop
      if (!skipValidation) {
        const validContexts = await this.roleContextRepo.findMany({
          where: {
            role_id: { in: roleIdsBigInt },
            context_id: (group as any).context_id,
          },
        });

        const validRoleIds = new Set(validContexts.map(rc => rc.role_id.toString()));
        for (const roleId of roleIds) {
          if (!validRoleIds.has(String(BigInt(roleId)))) {
            const role = roles.find(r => Number(r.id) === roleId);
            throw new BadRequestException(
              `Cannot assign roles that are not available in this context. Invalid role: ${role?.code}`
            );
          }
        }
      }
    }

    // Xóa tất cả roles cũ trong group này
    await this.assignmentRepo.deleteMany({
      user_id: BigInt(userId),
      group_id: BigInt(groupId),
    });

    // [H3] Bulk insert thay vì sequential loop (N roles = 1 DB call thay vì N calls)
    if (roles.length > 0) {
      await this.assignmentRepo.createMany(
        roles.map(role => ({
          user_id: BigInt(userId),
          role_id: BigInt(role.id),
          group_id: BigInt(groupId),
        }))
      );
    }

    // Clear cache
    await this.rbacCache.clearUserPermissionsInGroup(userId, groupId);
  }

}

