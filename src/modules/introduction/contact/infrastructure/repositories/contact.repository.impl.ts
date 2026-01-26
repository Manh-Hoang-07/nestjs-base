import { Injectable } from '@nestjs/common';
import { Contact, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IContactRepository, ContactFilter } from '../../domain/contact.repository';

@Injectable()
export class ContactRepositoryImpl extends PrismaRepository<
    Contact,
    Prisma.ContactWhereInput,
    Prisma.ContactCreateInput,
    Prisma.ContactUpdateInput,
    Prisma.ContactOrderByWithRelationInput
> implements IContactRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.contact as unknown as any, 'created_at:desc');
    }

    protected buildWhere(filter: ContactFilter): Prisma.ContactWhereInput {
        const where: Prisma.ContactWhereInput = {};

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { email: { contains: filter.search } },
                { subject: { contains: filter.search } },
            ];
        }

        if (filter.status) {
            where.status = filter.status as any;
        }

        return where;
    }
}
