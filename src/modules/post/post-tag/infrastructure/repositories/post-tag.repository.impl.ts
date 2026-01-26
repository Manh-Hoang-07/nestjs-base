
import { Injectable } from '@nestjs/common';
import { PostTag, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IPostTagRepository, PostTagFilter } from '../../domain/post-tag.repository';

@Injectable()
export class PostTagRepositoryImpl extends PrismaRepository<
    PostTag,
    Prisma.PostTagWhereInput,
    Prisma.PostTagCreateInput,
    Prisma.PostTagUpdateInput,
    Prisma.PostTagOrderByWithRelationInput
> implements IPostTagRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.postTag as unknown as any);
    }

    protected buildWhere(filter: PostTagFilter): Prisma.PostTagWhereInput {
        const where: Prisma.PostTagWhereInput = {};

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { slug: { contains: filter.search } },
            ];
        }

        if (filter.status !== undefined) {
            where.status = filter.status as any;
        }

        return where;
    }

    async findBySlug(slug: string): Promise<PostTag | null> {
        return this.findOne({ slug });
    }
}
