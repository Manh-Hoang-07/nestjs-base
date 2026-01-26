import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { IGroupRepository, GROUP_REPOSITORY } from '@/modules/core/context/group/domain/group.repository';
import { IContextRepository, CONTEXT_REPOSITORY } from '@/modules/core/context/context/domain/context.repository';
import { RbacService } from '@/modules/core/rbac/services/rbac.service';
import { RbacCacheService } from '@/modules/core/rbac/services/rbac-cache.service';
import { IUserGroupRepository, USER_GROUP_REPOSITORY } from '@/modules/core/rbac/user-group/domain/user-group.repository';
import { IUserRoleAssignmentRepository, USER_ROLE_ASSIGNMENT_REPOSITORY } from '@/modules/core/rbac/user-role-assignment/domain/user-role-assignment.repository';
import { IRoleRepository, ROLE_REPOSITORY } from '@/modules/core/iam/role/domain/role.repository';
import { IUserRepository, USER_REPOSITORY } from '@/modules/core/iam/user/domain/user.repository';

@Injectable()
export class UserGroupService {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepo: IGroupRepository,
    @Inject(CONTEXT_REPOSITORY)
    private readonly contextRepo: IContextRepository,
    @Inject(USER_GROUP_REPOSITORY)
    private readonly userGroupRepo: IUserGroupRepository,
    @Inject(USER_ROLE_ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepo: IUserRoleAssignmentRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepo: IRoleRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    private readonly rbacService: RbacService,
    private readonly rbacCache: RbacCacheService,
  ) { }

  async isOwner(groupId: number, userId: number): Promise<boolean> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) return false;
    return group.owner_id != null && Number(group.owner_id) === userId;
  }

  async canManageGroup(groupId: number, userId: number): Promise<boolean> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) return false;

    if (group.owner_id != null && Number(group.owner_id) === userId) return true;

    return this.rbacService.userHasPermissionsInGroup(userId, groupId, [
      'group.manage',
      'group.member.add',
      'group.member.manage',
    ]);
  }

  async getGroupContext(groupId: number) {
    const group = await this.groupRepo.findFirstRaw({
      where: { id: BigInt(groupId), status: 'active' as any },
      include: { context: true } as any,
    });
    return (group as any)?.context || null;
  }

  async addMember(
    groupId: number,
    memberUserId: number,
    roleIds: number[],
    requesterUserId: number,
  ): Promise<void> {
    const canManage = await this.canManageGroup(groupId, requesterUserId);
    if (!canManage) {
      throw new ForbiddenException('You do not have permission to add members to this group');
    }

    const group = await this.groupRepo.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    const member = await this.userRepo.findById(memberUserId);
    if (!member) throw new NotFoundException('Member user not found');

    const existingUserGroup = await this.userGroupRepo.findUnique(memberUserId, groupId);

    if (!existingUserGroup) {
      await this.userGroupRepo.create({
        user_id: BigInt(memberUserId),
        group_id: BigInt(groupId),
        joined_at: new Date(),
      } as any);
    }

    if (roleIds.length > 0) {
      const roles = await this.roleRepo.findManyRaw({
        where: { id: { in: roleIds.map((id) => BigInt(id)) } },
      });
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('Some role IDs are invalid');
      }

      await this.assignmentRepo.deleteMany({
        user_id: BigInt(memberUserId),
        group_id: BigInt(groupId),
      });

      for (const roleId of roleIds) {
        await this.rbacService.assignRoleToUser(memberUserId, roleId, groupId);
      }
    } else {
      await this.assignmentRepo.deleteMany({
        user_id: BigInt(memberUserId),
        group_id: BigInt(groupId),
      });
    }
  }

  async assignRolesToMember(
    groupId: number,
    memberUserId: number,
    roleIds: number[],
    requesterUserId: number,
  ): Promise<void> {
    const canManage = await this.canManageGroup(groupId, requesterUserId);
    if (!canManage) {
      throw new ForbiddenException('You do not have permission to manage roles in this group');
    }

    const existingUserGroup = await this.userGroupRepo.findUnique(memberUserId, groupId);

    if (!existingUserGroup) {
      throw new BadRequestException('User must be a member of the group before assigning roles');
    }

    await this.assignmentRepo.deleteMany({
      user_id: BigInt(memberUserId),
      group_id: BigInt(groupId),
    });

    if (roleIds.length > 0) {
      const roles = await this.roleRepo.findManyRaw({
        where: { id: { in: roleIds.map((id) => BigInt(id)) } },
      });
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('Some role IDs are invalid');
      }

      for (const roleId of roleIds) {
        await this.rbacService.assignRoleToUser(memberUserId, roleId, groupId);
      }
    }

    await this.rbacCache.clearUserPermissionsInGroup(memberUserId, groupId);
  }

  async removeMember(
    groupId: number,
    memberUserId: number,
    requesterUserId: number,
  ): Promise<void> {
    const canManage = await this.canManageGroup(groupId, requesterUserId);
    if (!canManage) {
      throw new ForbiddenException('You do not have permission to remove members from this group');
    }

    const group = await this.groupRepo.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    if (group.owner_id != null && Number(group.owner_id) === memberUserId) {
      throw new BadRequestException('Cannot remove owner from group');
    }

    await this.userGroupRepo.deleteMany({
      user_id: BigInt(memberUserId),
      group_id: BigInt(groupId),
    });

    await this.assignmentRepo.deleteMany({
      user_id: BigInt(memberUserId),
      group_id: BigInt(groupId),
    });

    await this.rbacCache.clearUserPermissionsInGroup(memberUserId, groupId);
  }

  async getGroupMembers(groupId: number) {
    const members = await this.assignmentRepo.findManyRaw({
      where: {
        group_id: BigInt(groupId),
      },
      include: {
        user: true,
        role: true,
      },
    });

    return members.map((m: any) => ({
      user_id: Number(m.user_id),
      user: m.user
        ? {
          id: Number(m.user.id),
          username: m.user.username,
          email: m.user.email,
        }
        : null,
      role_id: Number(m.role_id),
      role: m.role
        ? {
          id: Number(m.role.id),
          code: m.role.code,
          name: m.role.name,
        }
        : null,
    }));
  }

  async getUserGroups(userId: number) {
    const userGroups = await this.userGroupRepo.findManyRaw({
      where: { user_id: BigInt(userId) },
      include: {
        group: true,
      },
      orderBy: { joined_at: 'desc' } as any,
    });

    const result = await Promise.all(
      userGroups.map(async (ug: any) => {
        const group = ug.group;
        if (!group || group.status !== 'active') return null;

        const context = await this.getGroupContext(Number(group.id));

        const roleAssignments = await this.assignmentRepo.findManyRaw({
          where: {
            user_id: BigInt(userId),
            group_id: group.id,
          },
          include: { role: true },
        });

        return {
          id: Number(group.id),
          code: group.code,
          name: group.name,
          type: group.type,
          description: group.description,
          context: context
            ? {
              id: context.id.toString(),
              type: context.type,
              ref_id: context.ref_id ? context.ref_id.toString() : null,
              name: context.name,
            }
            : null,
          roles: roleAssignments
            .filter((ra: any) => ra.role)
            .map((ra: any) => ({
              id: Number(ra.role.id),
              code: ra.role.code,
              name: ra.role.name,
            })),
          joined_at: ug.joined_at,
        };
      }),
    );

    return result.filter((item: any) => item !== null);
  }
}

