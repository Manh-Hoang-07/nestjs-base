import { Injectable, Inject } from '@nestjs/common';
import { NotificationType } from '@/shared/enums/types/notification-type.enum';
import { IFollowRepository, FOLLOW_REPOSITORY } from '../../follow/domain/follow.repository';
import { ICommentRepository, COMMENT_REPOSITORY } from '../../comment/domain/comment.repository';
import { INotificationRepository, NOTIFICATION_REPOSITORY } from '@/modules/core/notification/domain/notification.repository';

@Injectable()
export class ComicNotificationService {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: IFollowRepository,
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: ICommentRepository,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) { }

  /**
   * Notify followers khi có chapter mới được publish
   */
  async notifyNewChapter(chapter: any) {
    if (!chapter.comic_id) {
      return;
    }

    const comicId = Number(chapter.comic_id);

    // Lấy tất cả followers của comic qua repository
    const followers = await this.followRepository.findMany({ comic_id: comicId }, {
      include: { comic: true }
    } as any);

    if (followers.length === 0) {
      return;
    }

    const comic = (followers[0] as any).comic;
    if (!comic) {
      return;
    }

    // Tạo notifications cho từng follower
    const notifications = followers.map((follow: any) =>
      this.notificationRepository.create({
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
        } as any,
        is_read: false,
      } as any)
    );

    await Promise.all(notifications);

    return { notified: notifications.length };
  }

  /**
   * Notify user khi có comment reply
   */
  async notifyCommentReply(commentId: number, parentCommentId: number, userId: number) {
    // Lấy parent comment để biết user cần notify qua repository
    const parentComment = await this.commentRepository.findById(parentCommentId);

    if (!parentComment || Number(parentComment.user_id) === userId) {
      return; // Không notify chính mình
    }

    const notification = await this.notificationRepository.create({
      user_id: parentComment.user_id,
      title: 'Có người trả lời bình luận của bạn',
      message: 'Bạn có một phản hồi mới cho bình luận của bạn',
      type: NotificationType.info as any,
      data: {
        comment_id: commentId,
        parent_comment_id: parentCommentId,
      } as any,
      is_read: false,
    } as any);

    return notification;
  }
}
