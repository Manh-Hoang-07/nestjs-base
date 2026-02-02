import { Injectable } from '@nestjs/common';
import { ComicComment, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { ICommentRepository, CommentFilter } from '../../domain/comment.repository';

@Injectable()
export class CommentRepositoryImpl extends PrismaRepository<
    ComicComment,
    Prisma.ComicCommentWhereInput,
    Prisma.ComicCommentCreateInput,
    Prisma.ComicCommentUpdateInput,
    Prisma.ComicCommentOrderByWithRelationInput
> implements ICommentRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.comicComment as any);
        this.isSoftDelete = false;
    }

    protected buildWhere(filter: CommentFilter): Prisma.ComicCommentWhereInput {
        const where: Prisma.ComicCommentWhereInput = {};

        if (filter.user_id) where.user_id = this.toPrimaryKey(filter.user_id);
        if (filter.comic_id) where.comic_id = this.toPrimaryKey(filter.comic_id);
        if (filter.chapter_id) where.chapter_id = this.toPrimaryKey(filter.chapter_id);
        if (filter.parent_id) where.parent_id = this.toPrimaryKey(filter.parent_id);
        if (filter.status) where.status = filter.status as any;

        return where;
    }
}
