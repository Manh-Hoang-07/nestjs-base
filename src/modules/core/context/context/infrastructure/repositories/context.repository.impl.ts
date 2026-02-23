
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

        if (filter.code) {
            where.code = filter.code;
        }

        if (filter.type) {
            where.type = filter.type;
        }

        if (filter.refId !== undefined || (filter as any).ref_id !== undefined) {
            const rid = filter.refId !== undefined ? filter.refId : (filter as any).ref_id;
            where.ref_id = rid === null ? null : BigInt(rid);
        }

        if (filter.status) {
            where.status = filter.status;
        }

        if (filter.ids) {
            where.id = { in: filter.ids.map(id => this.toPrimaryKey(id)) };
        }

        return where;
    }

    async findByTypeAndRefId(type: string, refId: number | null): Promise<Context | null> {
        return this.findOne({ type, ref_id: refId === null ? null : BigInt(refId) });
    }

    async findByCode(code: string): Promise<Context | null> {
        return this.findOne({ code });
    }

    async findActiveByIds(ids: (number | bigint)[]): Promise<Context[]> {
        return this.findMany({ ids, status: 'active' });
    }
}


