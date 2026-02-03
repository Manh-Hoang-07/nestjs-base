import { Injectable } from '@nestjs/common';
import { Bookmark, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IBookmarkRepository, BookmarkFilter } from '../../domain/bookmark.repository';

@Injectable()
export class BookmarkRepositoryImpl extends PrismaRepository<
    Bookmark,
    Prisma.BookmarkWhereInput,
    Prisma.BookmarkCreateInput,
    Prisma.BookmarkUpdateInput,
    Prisma.BookmarkOrderByWithRelationInput
> implements IBookmarkRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.bookmark as any);
        this.isSoftDelete = false;
    }

    protected buildWhere(filter: BookmarkFilter): Prisma.BookmarkWhereInput {
        const where: Prisma.BookmarkWhereInput = {};
        if (filter.user_id) where.user_id = this.toPrimaryKey(filter.user_id);
        if (filter.chapter_id) where.chapter_id = this.toPrimaryKey(filter.chapter_id);
        return where;
    }
}


