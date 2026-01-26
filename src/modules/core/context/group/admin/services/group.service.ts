import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { IGroupRepository, GROUP_REPOSITORY, GroupFilter } from '@/modules/core/context/group/domain/group.repository';
import { IContextRepository, CONTEXT_REPOSITORY } from '@/modules/core/context/context/domain/context.repository';
import { RbacService } from '@/modules/core/rbac/services/rbac.service';
import { IUserGroupRepository, USER_GROUP_REPOSITORY } from '@/modules/core/rbac/user-group/domain/user-group.repository';
import { IRoleRepository, ROLE_REPOSITORY } from '@/modules/core/iam/role/domain/role.repository';
import { BaseService } from '@/common/core/services';

@Injectable()
export class AdminGroupService extends BaseService<any, IGroupRepository> {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepo: IGroupRepository,
    @Inject(CONTEXT_REPOSITORY)
    private readonly contextRepo: IContextRepository,
    @Inject(USER_GROUP_REPOSITORY)
    private readonly userGroupRepo: IUserGroupRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepo: IRoleRepository,
    private readonly rbacService: RbacService,
  ) {
    super(groupRepo);
  }

  protected defaultSort = 'id:desc';


  /**
   * Alias for getOne
   */
  async findById(id: number) {
    return this.getOne(id);
  }

  async isSystemAdmin(userId: number): Promise<boolean> {
    return this.rbacService.userHasPermissionsInGroup(userId, null, [
      'system.manage',
      'group.manage',
    ]);
  }

  async createGroup(data: any, requesterUserId: number) {
    const isAdmin = await this.isSystemAdmin(requesterUserId);
    if (!isAdmin) {
      throw new ForbiddenException('Only system admin can create groups');
    }
    return this.create(data);
  }

  protected async beforeCreate(data: any) {
    const context = await this.contextRepo.findById(data.context_id);
    if (!context || (context as any).status !== 'active') {
      throw new NotFoundException(`Context with id ${data.context_id} not found`);
    }

    const existing = await this.groupRepo.findByCode(data.code);
    if (existing) {
      throw new BadRequestException(`Group with code "${data.code}" already exists`);
    }

    const payload = {
      ...data,
      context_id: BigInt(data.context_id),
      owner_id: data.owner_id ? BigInt(data.owner_id) : null,
      status: data.status || 'active',
    };
    return payload;
  }

  protected async afterCreate(group: any) {
    if (group.owner_id) {
      const existingUserGroup = await this.userGroupRepo.findUnique(Number(group.owner_id), Number(group.id));

      if (!existingUserGroup) {
        await this.userGroupRepo.create({
          user_id: group.owner_id,
          group_id: group.id,
        });
      }

      const ownerRole = await this.roleRepo.findOne({
        where: { code: 'admin' },
      });
      if (ownerRole) {
        await this.rbacService.assignRoleToUser(Number(group.owner_id), Number(ownerRole.id), Number(group.id));
      }
    }
  }

  async findByCode(code: string) {
    const group = await this.groupRepo.findByCode(code);
    return this.transform(group);
  }

  async updateGroup(id: number, data: any) {
    return this.update(id, data);
  }

  async deleteGroup(id: number) {
    return this.delete(id);
  }

  protected transform(group: any) {
    if (!group) return group;
    const item = super.transform(group) as any;
    if (item.context) {
      item.context = {
        ...item.context,
        id: Number(item.context.id),
        ref_id: item.context.ref_id ? Number(item.context.ref_id) : null,
      };
    }
    return item;
  }
}

