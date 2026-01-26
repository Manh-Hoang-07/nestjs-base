import { Injectable } from '@nestjs/common';
import { Staff, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IStaffRepository, StaffFilter } from '../../domain/staff.repository';

@Injectable()
export class StaffRepositoryImpl extends PrismaRepository<
    Staff,
    Prisma.StaffWhereInput,
    Prisma.StaffCreateInput,
    Prisma.StaffUpdateInput,
    Prisma.StaffOrderByWithRelationInput
> implements IStaffRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.staff as unknown as any, 'sort_order:asc');
    }

    protected buildWhere(filter: StaffFilter): Prisma.StaffWhereInput {
        const where: Prisma.StaffWhereInput = {};

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { position: { contains: filter.search } },
                { email: { contains: filter.search } },
            ];
        }

        if (filter.status) {
            where.status = filter.status as any;
        }

        if (filter.department) {
            where.department = { contains: filter.department };
        }

        return where;
    }
}
