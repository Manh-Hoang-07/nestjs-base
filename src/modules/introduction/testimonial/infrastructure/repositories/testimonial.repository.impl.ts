import { Injectable } from '@nestjs/common';
import { Testimonial, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { ITestimonialRepository, TestimonialFilter } from '../../domain/testimonial.repository';

@Injectable()
export class TestimonialRepositoryImpl extends PrismaRepository<
    Testimonial,
    Prisma.TestimonialWhereInput,
    Prisma.TestimonialCreateInput,
    Prisma.TestimonialUpdateInput,
    Prisma.TestimonialOrderByWithRelationInput
> implements ITestimonialRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.testimonial as unknown as any, 'sort_order:asc');
    }

    protected buildWhere(filter: TestimonialFilter): Prisma.TestimonialWhereInput {
        const where: Prisma.TestimonialWhereInput = {};

        if (filter.search) {
            where.OR = [
                { client_name: { contains: filter.search } },
                { client_company: { contains: filter.search } },
                { content: { contains: filter.search } },
            ];
        }

        if (filter.status) {
            where.status = filter.status as any;
        }

        if (filter.projectId !== undefined) {
            where.project_id = filter.projectId === null ? null : BigInt(filter.projectId);
        }

        return where;
    }
}
