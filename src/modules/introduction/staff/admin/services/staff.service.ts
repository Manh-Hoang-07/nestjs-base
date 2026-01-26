import { Injectable, Inject } from '@nestjs/common';
import { IStaffRepository, STAFF_REPOSITORY, StaffFilter } from '@/modules/introduction/staff/domain/staff.repository';
import { BaseContentService } from '@/common/core/services';
import { Staff } from '@prisma/client';

@Injectable()
export class StaffService extends BaseContentService<Staff, IStaffRepository> {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepo: IStaffRepository,
  ) {
    super(staffRepo);
  }

  protected defaultSort = 'sort_order:asc,created_at:desc';


  async getSimpleList(query: any) {
    return this.getList({
      ...query,
      limit: query.limit ?? 50,
    });
  }
}


