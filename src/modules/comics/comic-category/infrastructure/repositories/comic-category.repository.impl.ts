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
    }

    protected buildWhere(filter: any): Prisma.ComicCategoryWhereInput {
        const where: Prisma.ComicCategoryWhereInput = {
            deleted_at: filter.deleted_at === undefined ? null : filter.deleted_at,
        };

        if (filter.group_id) {
            where.OR = [
                { group_id: this.toPrimaryKey(filter.group_id) } as any,
                { group_id: null } as any,
            ];
        }

        if (filter.search) {
            where.name = { contains: filter.search };
        }

        return where;
    }

    async findBySlug(slug: string): Promise<ComicCategory | null> {
        return this.findOne({ slug, deleted_at: null });
    }
}
