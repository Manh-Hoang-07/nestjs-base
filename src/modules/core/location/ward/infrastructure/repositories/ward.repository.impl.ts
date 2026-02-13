import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { Ward, Prisma } from '@prisma/client';
import { IWardRepository } from '../../domain/ward.repository';

@Injectable()
export class WardRepositoryImpl
    extends PrismaRepository<Ward, Prisma.WardWhereInput, Prisma.WardCreateInput, Prisma.WardUpdateInput>
    implements IWardRepository {
    constructor(prisma: PrismaService) {
        super(prisma.ward as any);
    }

    protected buildWhere(filter: Record<string, any>): Prisma.WardWhereInput {
        const where: Prisma.WardWhereInput = {};
        if (filter.name) where.name = { contains: filter.name };
        if (filter.status) where.status = filter.status;
        if (filter.code) where.code = filter.code;
        if (filter.province_id) {
            where.province_id = typeof filter.province_id === 'bigint' ? filter.province_id : BigInt(filter.province_id);
        }
        return where;
    }
}
