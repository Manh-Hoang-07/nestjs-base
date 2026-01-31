import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { RequestContext } from '@/common/utils/request-context.util';
import { ComicNotificationService } from '@/modules/comics/core/services/comic-notification.service';
import { toPlain } from '@/common/base/services/prisma/prisma.utils';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserCommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: ComicNotificationService,
  ) {}

  /**
   * Tạo comment hoặc reply
   */
  async create(data: {
    comic_id: number;
    chapter_id?: number;
    parent_id?: number;
    content: string;
  }) {
    // Lấy userId từ RequestContext hoặc từ user object
    let userId: number | undefined = RequestContext.get<number>('userId');
    if (!userId) {
      const user = RequestContext.get<any>('user');
      userId = user?.id ? Number(user.id) : undefined;
    }
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    // Validate parent_id nếu có
    if (data.parent_id) {
      const parent = await this.prisma.comment.findFirst({
        where: { id: data.parent_id },
      });
      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }
      // Đảm bảo parent comment cùng comic_id
      if (Number(parent.comic_id) !== data.comic_id) {
        throw new BadRequestException('Parent comment must be from the same comic');
      }
    }

    const saved = await this.prisma.comment.create({
      data: {
        user_id: userId,
        comic_id: data.comic_id,
        chapter_id: data.chapter_id || null,
        parent_id: data.parent_id || null,
        content: data.content,
        status: 'visible',
        created_user_id: userId,
      },
    });

    // Notify nếu là reply
    if (data.parent_id) {
      await this.notificationService.notifyCommentReply(Number(saved.id), data.parent_id, userId);
    }

    // Convert BigInt thành number để tránh lỗi JSON serialization
    return toPlain(saved);
  }

  /**
   * Cập nhật comment
   */
  async update(commentId: number, content: string) {
    // Lấy userId từ RequestContext hoặc từ user object
    let userId: number | undefined = RequestContext.get<number>('userId');
    if (!userId) {
      const user = RequestContext.get<any>('user');
      userId = user?.id ? Number(user.id) : undefined;
    }
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, user_id: userId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
        updated_user_id: userId,
      },
    });

    // Convert BigInt thành number để tránh lỗi JSON serialization
    return toPlain(updated);
  }

  /**
   * Xóa comment (soft delete)
   */
  async delete(commentId: number) {
    // Lấy userId từ RequestContext hoặc từ user object
    let userId: number | undefined = RequestContext.get<number>('userId');
    if (!userId) {
      const user = RequestContext.get<any>('user');
      userId = user?.id ? Number(user.id) : undefined;
    }
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, user_id: userId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deleted_at: new Date() },
    });

    return { deleted: true };
  }

  /**
   * Lấy comments của user
   */
  async getByUser(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { user_id: userId },
        include: { comic: true, chapter: true },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where: { user_id: userId } }),
    ]);

    // Convert BigInt thành number để tránh lỗi JSON serialization
    return {
      data: toPlain(data),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

