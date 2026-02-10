import { Injectable, Inject } from '@nestjs/common';
import { toPlain } from '@/common/shared/utils';
import { ICommentRepository, COMMENT_REPOSITORY } from '../../domain/comment.repository';

@Injectable()
export class PublicCommentsService {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: ICommentRepository,
  ) { }

  /**
   * Lấy comments của comic (tree structure)
   */
  async getByComic(comicId: number, page: number = 1, limit: number = 20) {
    const { data: comments, meta } = await this.commentRepository.findAll({
      filter: {
        comic_id: comicId,
        chapter_id: null,
        parent_id: null,
        status: 'visible',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        },
        replies: {
          where: { status: 'visible' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              }
            }
          },
          orderBy: { created_at: 'asc' },
        },
      },
      sort: 'created_at:DESC',
      page,
      limit,
    } as any);

    return {
      data: toPlain(comments),
      meta,
    };
  }

  /**
   * Lấy comments của chapter (tree structure)
   */
  async getByChapter(chapterId: number, page: number = 1, limit: number = 20) {
    const { data: comments, meta } = await this.commentRepository.findAll({
      filter: {
        chapter_id: chapterId,
        parent_id: null,
        status: 'visible',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        },
        replies: {
          where: { status: 'visible' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              }
            }
          },
          orderBy: { created_at: 'asc' },
        },
      },
      sort: 'created_at:DESC',
      page,
      limit,
    } as any);

    return {
      data: toPlain(comments),
      meta,
    };
  }
}
