import { Injectable } from '@nestjs/common';
import { Partner, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IPartnerRepository, PartnerFilter } from '../../domain/partner.repository';

@Injectable()
export class PartnerRepositoryImpl extends PrismaRepository<
    Partner,
    Prisma.PartnerWhereInput,
    Prisma.PartnerCreateInput,
    Prisma.PartnerUpdateInput,
    Prisma.PartnerOrderByWithRelationInput
> implements IPartnerRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.partner as unknown as any, 'sort_order:asc');
    }

    protected buildWhere(filter: PartnerFilter): Prisma.PartnerWhereInput {
        const where: Prisma.PartnerWhereInput = {};

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { description: { contains: filter.search } },
            ];
        }

        if (filter.status) {
            where.status = filter.status as any;
        }

        if (filter.type) {
            where.type = filter.type as any;
        }

        return where;
    }
}
