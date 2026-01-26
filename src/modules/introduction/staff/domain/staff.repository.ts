
import { Staff } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const STAFF_REPOSITORY = 'IStaffRepository';

export interface StaffFilter {
    search?: string;
    status?: string;
    department?: string;
}

export interface IStaffRepository extends IRepository<Staff> {
}
