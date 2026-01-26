import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { RequestContext } from '@/common/shared/utils';
import { RbacService } from '@/modules/core/rbac/services/rbac.service';
import { ChangePasswordDto } from '@/modules/core/iam/user/admin/dtos/change-password.dto';
import { IUserRepository, USER_REPOSITORY, UserFilter } from '@/modules/core/iam/user/domain/user.repository';
import { BaseService } from '@/common/core/services';

@Injectable()
export class UserService extends BaseService<any, IUserRepository> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    private readonly rbacService: RbacService,
  ) {
    super(userRepo);
  }

  protected async prepareFilters(filter: any) {
    // Lấy context để filter theo group nếu cần
    const context = RequestContext.get<any>('context');
    const contextId = RequestContext.get<number>('contextId') || 1;
    const groupId = RequestContext.get<number | null>('groupId');

    // Nếu không phải system context, filter theo groupId
    if (context && context.type !== 'system' && contextId !== 1 && groupId) {
      return { ...filter, groupId };
    }

    return filter;
  }

  async getSimpleList(query: any) {
    return this.getList({ ...query, limit: 1000 });
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

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.getOne(id);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    const hashed = await bcrypt.hash(dto.password, 10);
    await this.userRepo.update(id, { password: hashed });
  }

  async userChangePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.userRepo.findByIdForAuth(id);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    if (user.password) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(id, { password: hashed });
  }


  protected async beforeCreate(data: any) {
    const payload = { ...data };

    // Hash password
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    // Unique Checks
    if (payload.email && !(await this.userRepo.checkUnique('email', payload.email))) {
      throw new BadRequestException('Email đã được sử dụng.');
    }
    if (payload.phone && !(await this.userRepo.checkUnique('phone', payload.phone))) {
      throw new BadRequestException('Số điện thoại đã được sử dụng.');
    }
    if (payload.username && !(await this.userRepo.checkUnique('username', payload.username))) {
      throw new BadRequestException('Tên đăng nhập đã được sử dụng.');
    }

    // Tách dữ liệu quan hệ để xử lý trong afterCreate
    delete payload.role_ids;
    delete payload.profile;

    return payload;
  }

  protected async afterCreate(user: any, data: any) {
    const id = (user as any).id;

    // Xử lý Profile
    if (data.profile) {
      await this.userRepo.upsertProfile(id, data.profile);
    }

    // Xử lý Roles
    const roleIds = this.normalizeIdArray(data.role_ids);
    if (roleIds && roleIds.length > 0) {
      const groupId = RequestContext.get<number | null>('groupId');
      if (groupId) {
        await this.rbacService.syncRolesInGroup(Number(id), groupId, roleIds, true);
      }
    }
  }

  protected async beforeUpdate(id: number | bigint, data: any) {
    const payload = { ...data };

    // Hash password if present
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    } else {
      delete payload.password;
    }

    // Unique Checks (exclude current user)
    if (payload.email && !(await this.userRepo.checkUnique('email', payload.email, Number(id)))) {
      throw new BadRequestException('Email đã được sử dụng.');
    }
    if (payload.phone && !(await this.userRepo.checkUnique('phone', payload.phone, Number(id)))) {
      throw new BadRequestException('Số điện thoại đã được sử dụng.');
    }
    if (payload.username && !(await this.userRepo.checkUnique('username', payload.username, Number(id)))) {
      throw new BadRequestException('Tên đăng nhập đã được sử dụng.');
    }

    // Tách dữ liệu quan hệ để xử lý trong afterUpdate
    delete payload.role_ids;
    delete payload.profile;

    return payload;
  }

  protected async afterUpdate(user: any, data: any) {
    const id = (user as any).id;

    // Xử lý Profile
    if (data.profile) {
      await this.userRepo.upsertProfile(id, data.profile);
    }

    // Xử lý Roles
    const roleIds = this.normalizeIdArray(data.role_ids);
    if (roleIds !== null) {
      const groupId = RequestContext.get<number | null>('groupId');
      if (groupId) {
        await this.rbacService.syncRolesInGroup(Number(id), groupId, roleIds, true);
      }
    }
  }

  private normalizeIdArray(input: any): number[] | null {
    if (input === undefined) return null;
    if (!Array.isArray(input)) return [];
    return input.map((id: any) => Number(id)).filter((id) => !Number.isNaN(id));
  }

  protected transform(user: any) {
    if (!user) return user;
    const u = super.transform(user) as any;
    const groupId = RequestContext.get<number | null>('groupId');

    if (groupId && u.user_role_assignments) {
      u.role_ids = (u.user_role_assignments as any[])
        .filter((ura: any) => ura.group_id === groupId)
        .map((ura: any) => ura.role_id);
    } else {
      u.role_ids = u.role_ids || [];
    }

    delete u.user_role_assignments;
    return u;
  }
}
