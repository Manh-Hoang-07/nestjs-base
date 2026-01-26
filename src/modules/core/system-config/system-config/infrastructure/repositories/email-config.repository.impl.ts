import { Injectable } from '@nestjs/common';
import { EmailConfig, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IEmailConfigRepository, EmailConfigFilter } from '../../domain/email-config.repository';

@Injectable()
export class EmailConfigRepositoryImpl extends PrismaRepository<
    EmailConfig,
    Prisma.EmailConfigWhereInput,
    Prisma.EmailConfigCreateInput,
    Prisma.EmailConfigUpdateInput,
    Prisma.EmailConfigOrderByWithRelationInput
> implements IEmailConfigRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.emailConfig as unknown as any);
    }

    protected buildWhere(filter: EmailConfigFilter): Prisma.EmailConfigWhereInput {
        const where: Prisma.EmailConfigWhereInput = {};
        return where;
    }

    async getConfig(): Promise<EmailConfig | null> {
        return this.prisma.emailConfig.findFirst({
            where: { deleted_at: null },
        });
    }
}
