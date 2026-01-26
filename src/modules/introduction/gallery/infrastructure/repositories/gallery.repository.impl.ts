import { Injectable } from '@nestjs/common';
import { Gallery, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IGalleryRepository, GalleryFilter } from '../../domain/gallery.repository';

@Injectable()
export class GalleryRepositoryImpl extends PrismaRepository<
    Gallery,
    Prisma.GalleryWhereInput,
    Prisma.GalleryCreateInput,
    Prisma.GalleryUpdateInput,
    Prisma.GalleryOrderByWithRelationInput
> implements IGalleryRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.gallery as unknown as any, 'sort_order:asc');
    }

    protected buildWhere(filter: GalleryFilter): Prisma.GalleryWhereInput {
        const where: Prisma.GalleryWhereInput = {};

        if (filter.search) {
            where.OR = [
                { title: { contains: filter.search } },
                { slug: { contains: filter.search } },
            ];
        }

        if (filter.status) {
            where.status = filter.status as any;
        }

        if (filter.isFeatured !== undefined) {
            where.featured = filter.isFeatured;
        }

        return where;
    }

    async findBySlug(slug: string): Promise<Gallery | null> {
        return this.findOne({ slug });
    }
}
