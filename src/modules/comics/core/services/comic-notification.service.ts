import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { NotificationType } from '@/shared/enums/types/notification-type.enum';

@Injectable()
export class ComicNotificationService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Notify followers khi có chapter mới được publish
   */
  async notifyNewChapter(chapter: any) {
    if (!chapter.comic_id) {
      return;
    }

    const comicId = Number(chapter.comic_id);

    // Lấy tất cả followers của comic
    // Note: Prisma client sẽ có tên là comicFollow sau khi generate
    const followers = await (this.prisma as any).comicFollow.findMany({
      where: { comic_id: BigInt(comicId) },
      include: { comic: true },
    });

    if (followers.length === 0) {
      return;
    }

    const comic = followers[0].comic;
    if (!comic) {
      return;
    }

    // Tạo notifications cho từng follower
    const notifications = followers.map((follow: any) =>
      this.prisma.notification.create({
        data: {
          user_id: BigInt(Number(follow.user_id)),
          title: `Chapter mới: ${chapter.title}`,
          message: `${comic.title} đã có chapter mới: ${chapter.chapter_label || chapter.chapter_index}`,
          type: NotificationType.info as any,
          data: {
            comic_id: Number(comic.id),
            comic_slug: comic.slug,
            comic_title: comic.title,
            chapter_id: Number(chapter.id),
            chapter_index: chapter.chapter_index,
            chapter_label: chapter.chapter_label,
          },
          is_read: false,
        },
      })
    );

    await Promise.all(notifications);

    return { notified: notifications.length };
  }

  /**
   * Notify user khi có comment reply
   */
  async notifyCommentReply(commentId: number, parentCommentId: number, userId: number) {
    // Lấy parent comment để biết user cần notify
    const parentComment = await this.prisma.comment.findFirst({
      where: { id: BigInt(parentCommentId), deleted_at: null },
    });

    if (!parentComment || Number(parentComment.user_id) === userId) {
      return; // Không notify chính mình
    }

    const notification = await this.prisma.notification.create({
      data: {
        user_id: parentComment.user_id,
        title: 'Có người trả lời bình luận của bạn',
        message: 'Bạn có một phản hồi mới cho bình luận của bạn',
        type: NotificationType.info as any,
        data: {
          comment_id: commentId,
          parent_comment_id: parentCommentId,
        },
        is_read: false,
      },
    });

    return notification;
  }
}
