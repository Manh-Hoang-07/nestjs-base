import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { IContextRepository, CONTEXT_REPOSITORY } from '@/modules/core/context/context/domain/context.repository';
import { RbacService } from '@/modules/core/rbac/services/rbac.service';
import { IGroupRepository, GROUP_REPOSITORY } from '@/modules/core/context/group/domain/group.repository';
import { BaseService } from '@/common/core/services';

@Injectable()
export class AdminContextService extends BaseService<any, IContextRepository> {
  constructor(
    @Inject(CONTEXT_REPOSITORY)
    private readonly contextRepo: IContextRepository,
    @Inject(forwardRef(() => RbacService))
    private readonly rbacService: RbacService,
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepo: IGroupRepository,
  ) {
    super(contextRepo);
  }

  protected defaultSort = 'id:desc';


  private async isSystemAdmin(userId: number): Promise<boolean> {
    return this.rbacService.userHasPermissionsInGroup(userId, null, [
      'system.manage',
      'group.manage',
    ]);
  }

  async findById(id: number) {
    const context = await this.contextRepo.findOne({
      id,
      status: 'active'
    });
    return this.transform(context);
  }

  async findByTypeAndRefId(type: string, refId: number | null) {
    const context = await this.contextRepo.findByTypeAndRefId(type, refId);
    return this.transform(context);
  }

  async createContext(data: any, requesterUserId: number) {
    const isAdmin = await this.isSystemAdmin(requesterUserId);
    if (!isAdmin) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }
    return this.create(data);
  }

  protected async beforeCreate(data: any) {
    const existing = await this.contextRepo.findByTypeAndRefId(data.type, data.ref_id ?? null);
    if (existing) {
      throw new BadRequestException(`Context với loại "${data.type}" và ref_id "${data.ref_id ?? 'null'}" đã tồn tại`);
    }

    const code = data.code || `${data.type}-${data.ref_id ?? 'system'}`;
    const existingByCode = await this.contextRepo.findByCode(code);
    if (existingByCode) {
      throw new BadRequestException(`Context với mã "${code}" đã tồn tại`);
    }

    const payload = {
      ...data,
      ref_id: data.ref_id ? BigInt(data.ref_id) : null,
      code,
      status: data.status || 'active',
    };
    return payload;
  }

  async updateContext(id: number, data: any, requesterUserId: number) {
    const isAdmin = await this.isSystemAdmin(requesterUserId);
    if (!isAdmin) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }
    return this.update(id, data);
  }

  protected async beforeUpdate(id: number | bigint, data: any) {
    if (Number(id) === 1) {
      throw new BadRequestException('Không thể cập nhật context hệ thống');
    }

    const current = await this.contextRepo.findById(id);
    if (!current) throw new NotFoundException('Context không tồn tại');

    if (data.code && data.code !== current.code) {
      const existing = await this.contextRepo.findByCode(data.code);
      if (existing) {
        throw new BadRequestException(`Context với mã "${data.code}" đã tồn tại`);
      }
    }

    if (data.ref_id !== undefined) {
      data.ref_id = data.ref_id ? BigInt(data.ref_id) : null;
    }

    return data;
  }

  async deleteContext(id: number) {
    return this.delete(id);
  }

  protected async beforeDelete(id: number | bigint): Promise<boolean> {
    if (Number(id) === 1) {
      throw new BadRequestException('Không thể xóa context hệ thống');
    }

    const groups = await this.groupRepo.findManyRaw({
      where: { context_id: BigInt(id), deleted_at: null },
    });

    if (groups.length > 0) {
      throw new BadRequestException(`Không thể xóa context: ${groups.length} group đang sử dụng context này`);
    }
    return true;
  }
}
