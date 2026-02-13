import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { Province, Prisma } from '@prisma/client';
import { IProvinceRepository } from '../../domain/province.repository';

@Injectable()
export class ProvinceRepositoryImpl
    extends PrismaRepository<Province, Prisma.ProvinceWhereInput, Prisma.ProvinceCreateInput, Prisma.ProvinceUpdateInput>
    implements IProvinceRepository {
    constructor(prisma: PrismaService) {
        super(prisma.province as any);
    }

    protected buildWhere(filter: Record<string, any>): Prisma.ProvinceWhereInput {
        const where: Prisma.ProvinceWhereInput = {};
        if (filter.name) where.name = { contains: filter.name };
        if (filter.status) where.status = filter.status;
        if (filter.code) where.code = filter.code;
        if (filter.country_id) {
            where.country_id = typeof filter.country_id === 'bigint' ? filter.country_id : BigInt(filter.country_id);
        }
        return where;
    }
}
