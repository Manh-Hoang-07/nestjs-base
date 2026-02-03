import { Injectable } from '@nestjs/common';
import { Comic, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IComicRepository, ComicFilter } from '../../domain/comic.repository';
import { createPaginationMeta } from '@/common/core/utils';

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
        super(prisma.comic as any, 'updated_at:desc');
        this.isSoftDelete = false;
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

    protected override parseSort(sortStr: string): Prisma.ComicOrderByWithRelationInput[] {
        const sorts = sortStr.split(',');
        return sorts.map((s) => {
            const [field, dir] = s.split(':');
            const direction = dir ? dir.toLowerCase() : 'desc';

            // Handle stats relation sorting
            if (['view_count', 'follow_count', 'rating_count', 'rating_sum'].includes(field)) {
                return {
                    stats: {
                        [field]: direction,
                    },
                } as any;
            }

            return { [field]: direction } as any;
        });
    }

    protected buildWhere(filter: ComicFilter): Prisma.ComicWhereInput {
        const where: Prisma.ComicWhereInput = {};

        if (filter.group_id !== undefined) {
            where.group_id = filter.group_id === null ? null : this.toPrimaryKey(filter.group_id);
        }

        if (filter.status) {
            if (typeof filter.status === 'string') {
                where.status = filter.status as any;
            } else {
                where.status = filter.status as any;
            }
        }

        if (filter.author) {
            where.author = { contains: filter.author };
        }

        if (filter.created_user_id) {
            where.created_user_id = this.toPrimaryKey(filter.created_user_id);
        }

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

        if (filter.is_featured !== undefined) {
            where.is_featured = filter.is_featured === true || (filter.is_featured as any) === 'true';
        }

        return where;
    }

    async findBySlug(slug: string): Promise<Comic | null> {
        return this.findOne({ slug } as any);
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

    async incrementView(id: number | bigint): Promise<void> {
        await this.prisma.comicStats.upsert({
            where: { comic_id: this.toPrimaryKey(id) },
            create: {
                comic_id: this.toPrimaryKey(id),
                view_count: 1,
            },
            update: {
                view_count: { increment: 1 },
            },
        });
    }

    async getChapters(id: number | bigint, options: any = {}): Promise<any> {
        const comicId = this.toPrimaryKey(id);
        const page = Math.max(Number(options.page) || 1, 1);
        const limit = Math.max(Number(options.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.chapter.findMany({
                where: { comic_id: comicId, status: 'published' },
                select: {
                    id: true,
                    comic_id: true,
                    title: true,
                    chapter_index: true,
                    chapter_label: true,
                    status: true,
                    view_count: true,
                    created_at: true,
                    updated_at: true,
                    // team_id, created_user_id, updated_user_id removed
                },
                orderBy: { chapter_index: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.chapter.count({
                where: { comic_id: comicId, status: 'published' },
            }),
        ]);

        return {
            data,
            meta: createPaginationMeta(page, limit, total),
        };
    }
}


