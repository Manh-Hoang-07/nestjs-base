import { Injectable } from '@nestjs/common';
import { ComicCategory, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IComicCategoryRepository } from '../../domain/comic-category.repository';

@Injectable()
export class ComicCategoryRepositoryImpl extends PrismaRepository<
    ComicCategory,
    Prisma.ComicCategoryWhereInput,
    Prisma.ComicCategoryCreateInput,
    Prisma.ComicCategoryUpdateInput,
    Prisma.ComicCategoryOrderByWithRelationInput
> implements IComicCategoryRepository {
    constructor(
        private readonly prisma: PrismaService,
    ) {
        super(prisma.comicCategory as any);
        this.isSoftDelete = false;
    }

    protected buildWhere(filter: any): Prisma.ComicCategoryWhereInput {
        const where: Prisma.ComicCategoryWhereInput = {};

        if (filter.slug) {
            where.slug = filter.slug;
        }

        if (filter.group_id) {
            where.OR = [
                { group_id: this.toPrimaryKey(filter.group_id) },
                { group_id: null },
            ];
        }

        if (filter.search) {
            where.name = { contains: filter.search };
        }

        return where;
    }

    async findBySlug(slug: string): Promise<ComicCategory | null> {
        return this.findOne({ slug } as any);
    }
}


