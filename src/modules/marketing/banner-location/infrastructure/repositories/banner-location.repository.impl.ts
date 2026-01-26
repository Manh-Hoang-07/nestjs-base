
import { Injectable } from '@nestjs/common';
import { BannerLocation, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IBannerLocationRepository, BannerLocationFilter } from '../../domain/banner-location.repository';

@Injectable()
export class BannerLocationRepositoryImpl extends PrismaRepository<
    BannerLocation,
    Prisma.BannerLocationWhereInput,
    Prisma.BannerLocationCreateInput,
    Prisma.BannerLocationUpdateInput,
    Prisma.BannerLocationOrderByWithRelationInput
> implements IBannerLocationRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.bannerLocation as unknown as any);
    }

    protected buildWhere(filter: BannerLocationFilter): Prisma.BannerLocationWhereInput {
        const where: Prisma.BannerLocationWhereInput = {};

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { code: { contains: filter.search } },
            ];
        }

        if (filter.status) {
            where.status = filter.status as any;
        }

        return where;
    }

    async findByCode(code: string): Promise<BannerLocation | null> {
        return this.findOne({ code });
    }
}
