import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IStaffRepository, STAFF_REPOSITORY, StaffFilter } from '@/modules/introduction/staff/domain/staff.repository';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { BaseService } from '@/common/core/services';
import { Staff } from '@prisma/client';

@Injectable()
export class PublicStaffService extends BaseService<Staff, IStaffRepository> {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepo: IStaffRepository,
  ) {
    super(staffRepo);
  }

  async getList(query: any) {
    const filter: StaffFilter = {
      status: BasicStatus.active
    };
    if (query.search) filter.search = query.search;
    if (query.department) filter.department = query.department;

    return super.getList({
      page: query.page,
      limit: query.limit,
      sort: query.sort || 'sort_order:asc',
      filter,
    });
  }

  async findByDepartment(department: string) {
    const result = await this.getList({ department, limit: 100, page: 1 } as any);
    return result.data;
  }

  async getOne(id: number) {
    const staff = await super.getOne(id);
    if (!staff || (staff as any).status !== BasicStatus.active) {
      throw new NotFoundException('Staff not found or inactive');
    }
    return staff;
  }
}

