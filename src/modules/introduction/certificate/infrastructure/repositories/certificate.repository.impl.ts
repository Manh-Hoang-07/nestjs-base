import { Injectable } from '@nestjs/common';
import { Certificate, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { ICertificateRepository, CertificateFilter } from '../../domain/certificate.repository';

@Injectable()
export class CertificateRepositoryImpl extends PrismaRepository<
    Certificate,
    Prisma.CertificateWhereInput,
    Prisma.CertificateCreateInput,
    Prisma.CertificateUpdateInput,
    Prisma.CertificateOrderByWithRelationInput
> implements ICertificateRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.certificate as unknown as any, 'sort_order:asc');
    }

    protected buildWhere(filter: CertificateFilter): Prisma.CertificateWhereInput {
        const where: Prisma.CertificateWhereInput = {};

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
            ];
        }

        if (filter.status) {
            where.status = filter.status as any;
        }

        return where;
    }
}
