
import { Injectable } from '@nestjs/common';
import { Context, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IContextRepository, ContextFilter } from '../../domain/context.repository';

@Injectable()
export class ContextRepositoryImpl extends PrismaRepository<
    Context,
    Prisma.ContextWhereInput,
    Prisma.ContextCreateInput,
    Prisma.ContextUpdateInput,
    Prisma.ContextOrderByWithRelationInput
> implements IContextRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.context as unknown as any, 'id:desc');
    }

    protected buildWhere(filter: ContextFilter): Prisma.ContextWhereInput {
        const where: Prisma.ContextWhereInput = {};

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { code: { contains: filter.search } },
            ];
        }

        if (filter.type) {
            where.type = filter.type;
        }

        if (filter.refId !== undefined) {
            where.ref_id = filter.refId === null ? null : BigInt(filter.refId);
        }

        if (filter.status) {
            where.status = filter.status;
        }

        return where;
    }

    async findByTypeAndRefId(type: string, refId: number | null): Promise<Context | null> {
        return this.findOne({ type, ref_id: refId === null ? null : BigInt(refId) });
    }

    async findByCode(code: string): Promise<Context | null> {
        return this.findOne({ code });
    }
}
