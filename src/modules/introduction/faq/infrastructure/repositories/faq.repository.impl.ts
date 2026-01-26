import { Injectable } from '@nestjs/common';
import { Faq, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IFaqRepository, FaqFilter } from '../../domain/faq.repository';

@Injectable()
export class FaqRepositoryImpl extends PrismaRepository<
    Faq,
    Prisma.FaqWhereInput,
    Prisma.FaqCreateInput,
    Prisma.FaqUpdateInput,
    Prisma.FaqOrderByWithRelationInput
> implements IFaqRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.faq as unknown as any, 'sort_order:asc');
    }

    protected buildWhere(filter: FaqFilter): Prisma.FaqWhereInput {
        const where: Prisma.FaqWhereInput = {};

        if (filter.search) {
            where.OR = [
                { question: { contains: filter.search } },
                { answer: { contains: filter.search } },
            ];
        }

        if (filter.status) {
            where.status = filter.status as any;
        }

        return where;
    }

    async incrementViewCount(id: number | bigint): Promise<Faq> {
        return this.update(id, { view_count: { increment: 1 } });
    }

    async incrementHelpfulCount(id: number | bigint): Promise<Faq> {
        return this.update(id, { helpful_count: { increment: 1 } });
    }
}
