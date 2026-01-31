import { Injectable } from '@nestjs/common';
import { Comic, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IComicRepository } from '../../domain/comic.repository';

@Injectable()
export class ComicRepositoryImpl extends PrismaRepository<
    Comic,
    Prisma.ComicWhereInput,
    Prisma.ComicCreateInput,
    Prisma.ComicUpdateInput,
    Prisma.ComicOrderByWithRelationInput
> implements IComicRepository {
    constructor(
        private readonly prisma: PrismaService,
    ) {
        super(prisma.comic as any);
        this.defaultSelect = {
            id: true,
            slug: true,
            title: true,
            description: true,
            cover_image: true,
            author: true,
            status: true,
            created_user_id: true,
            updated_user_id: true,
            created_at: true,
            updated_at: true,
            last_chapter_id: true,
            last_chapter_updated_at: true,
            categoryLinks: {
                include: {
                    category: true,
                },
            },
            stats: true,
        };
    }

    protected buildWhere(filter: any): Prisma.ComicWhereInput {
        const where: Prisma.ComicWhereInput = {
            deleted_at: null,
        };

        if (filter.status) where.status = filter.status;
        if (filter.author) where.author = { contains: filter.author };

        if (filter.search) {
            where.OR = [
                { title: { contains: filter.search } },
                { slug: { contains: filter.search } },
                { author: { contains: filter.search } },
            ];
        }

        if (filter.categoryId) {
            where.categoryLinks = {
                some: {
                    comic_category_id: this.toPrimaryKey(filter.categoryId),
                },
            };
        }

        if (filter.excludeId) {
            where.id = { not: this.toPrimaryKey(filter.excludeId) };
        }

        return where;
    }

    async findBySlug(slug: string): Promise<Comic | null> {
        return this.findOne({ slug, deleted_at: null });
    }

    async syncCategories(comicId: number | bigint, categoryIds: (number | bigint)[]): Promise<void> {
        const id = this.toPrimaryKey(comicId);

        // Delete existing category links
        await this.prisma.comicCategoryOnComic.deleteMany({
            where: { comic_id: id },
        });

        // Create new category links
        if (categoryIds.length > 0) {
            await this.prisma.comicCategoryOnComic.createMany({
                data: categoryIds.map(catId => ({
                    comic_id: id,
                    comic_category_id: this.toPrimaryKey(catId),
                })),
            });
        }
    }
}
