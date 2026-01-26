import { Injectable } from '@nestjs/common';
import { GeneralConfig, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IGeneralConfigRepository, GeneralConfigFilter } from '../../domain/general-config.repository';

@Injectable()
export class GeneralConfigRepositoryImpl extends PrismaRepository<
    GeneralConfig,
    Prisma.GeneralConfigWhereInput,
    Prisma.GeneralConfigCreateInput,
    Prisma.GeneralConfigUpdateInput,
    Prisma.GeneralConfigOrderByWithRelationInput
> implements IGeneralConfigRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.generalConfig as unknown as any);
    }

    protected buildWhere(filter: GeneralConfigFilter): Prisma.GeneralConfigWhereInput {
        const where: Prisma.GeneralConfigWhereInput = {};
        return where;
    }

    async getConfig(): Promise<GeneralConfig | null> {
        return this.prisma.generalConfig.findFirst({
            where: { deleted_at: null },
        });
    }
}
