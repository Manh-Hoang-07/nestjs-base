import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { Country, Prisma } from '@prisma/client';
import { ICountryRepository } from '../../domain/country.repository';

@Injectable()
export class CountryRepositoryImpl
    extends PrismaRepository<Country, Prisma.CountryWhereInput, Prisma.CountryCreateInput, Prisma.CountryUpdateInput>
    implements ICountryRepository {
    constructor(prisma: PrismaService) {
        super(prisma.country as any);
    }

    protected buildWhere(filter: Record<string, any>): Prisma.CountryWhereInput {
        const where: Prisma.CountryWhereInput = {};
        if (filter.name) where.name = { contains: filter.name };
        if (filter.status) where.status = filter.status;
        if (filter.code) where.code = filter.code;
        return where;
    }
}
