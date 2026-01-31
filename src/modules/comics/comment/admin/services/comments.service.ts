import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { createPaginationMeta } from '@/common/base/utils/pagination.helper';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get list với filter và search
   */
  async getList(filters: any = {}, options: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;
    const sort = options.sort || 'created_at:DESC';
    const [sortField, sortOrder] = sort.split(':');

    // Build where clause
    const where: Prisma.CommentWhereInput = {
      deleted_at: null,
    };

    if (filters.comic_id) {
      where.comic_id = filters.comic_id;
    }

    if (filters.chapter_id) {
      where.chapter_id = filters.chapter_id;
    }

    if (filters.user_id) {
      where.user_id = filters.user_id;
    }

    if (filters.status) {
      where.status = filters.status as any;
    }

    if (filters.parent_id !== undefined) {
      if (filters.parent_id === null || filters.parent_id === 'null') {
        where.parent_id = null;
      } else {
        where.parent_id = filters.parent_id;
      }
    }

    if (filters.search) {
      where.content = { contains: filters.search };
    }

    if (filters.date_from || filters.date_to) {
      where.created_at = {};
      if (filters.date_from) {
        where.created_at.gte = new Date(filters.date_from);
      }
      if (filters.date_to) {
        where.created_at.lte = new Date(filters.date_to);
      }
    }

    // Build orderBy
    const prismaSortOrder = sortOrder.toLowerCase() === 'asc' ? Prisma.SortOrder.asc : Prisma.SortOrder.desc;
    let orderBy: Prisma.CommentOrderByWithRelationInput;
    
    if (sortField && ['id', 'created_at', 'updated_at', 'user_id', 'comic_id'].includes(sortField)) {
      switch (sortField) {
        case 'id':
          orderBy = { id: prismaSortOrder };
          break;
        case 'created_at':
          orderBy = { created_at: prismaSortOrder };
          break;
        case 'updated_at':
          orderBy = { updated_at: prismaSortOrder };
          break;
        case 'user_id':
          orderBy = { user_id: prismaSortOrder };
          break;
        case 'comic_id':
          orderBy = { comic_id: prismaSortOrder };
          break;
        default:
          orderBy = { created_at: Prisma.SortOrder.desc };
      }
    } else {
      orderBy = { created_at: Prisma.SortOrder.desc };
    }

    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        include: {
          user: true,
          comic: true,
          chapter: true,
          parent: true,
          replies: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      data,
      meta: createPaginationMeta(page, limit, total),
    };
  }

  /**
   * Get one với relations
   */
  async getOne(where: any): Promise<any | null> {
    return this.prisma.comment.findFirst({
      where: { ...where, deleted_at: null },
      include: {
        user: true,
        comic: true,
        chapter: true,
        parent: true,
        replies: true,
      },
    });
  }

  /**
   * Update comment
   */
  async update(id: number, data: { content?: string; status?: 'visible' | 'hidden' }) {
    const comment = await this.getOne({ id });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const updateData: Prisma.CommentUpdateInput = {};
    if (data.content !== undefined) {
      updateData.content = data.content;
    }
    if (data.status !== undefined) {
      updateData.status = data.status as any;
    }

    return this.prisma.comment.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        comic: true,
        chapter: true,
        parent: true,
        replies: true,
      },
    });
  }

  /**
   * Delete comment (soft delete)
   */
  async delete(id: number) {
    const comment = await this.getOne({ id });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Soft delete comment và tất cả replies
    await this.prisma.comment.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    
    // Soft delete all replies
    await this.prisma.comment.updateMany({
      where: { parent_id: id },
      data: { deleted_at: new Date() },
    });

    return { deleted: true };
  }

  /**
   * Restore comment
   */
  async restore(id: number) {
    const comment = await this.prisma.comment.findFirst({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.prisma.comment.update({
      where: { id },
      data: { deleted_at: null },
    });

    return this.getOne({ id });
  }

  /**
   * Get comment statistics
   */
  async getStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [total, visible, hidden, todayCount, thisWeekCount, thisMonthCount] = await Promise.all([
      this.prisma.comment.count({ where: { deleted_at: null } }),
      this.prisma.comment.count({ where: { status: 'visible', deleted_at: null } }),
      this.prisma.comment.count({ where: { status: 'hidden', deleted_at: null } }),
      this.prisma.comment.count({
        where: {
          created_at: { gte: today },
          deleted_at: null,
        },
      }),
      this.prisma.comment.count({
        where: {
          created_at: { gte: startOfWeek },
          deleted_at: null,
        },
      }),
      this.prisma.comment.count({
        where: {
          created_at: { gte: startOfMonth },
          deleted_at: null,
        },
      }),
    ]);

    return {
      total,
      visible,
      hidden,
      today: todayCount,
      this_week: thisWeekCount,
      this_month: thisMonthCount,
    };
  }
}

