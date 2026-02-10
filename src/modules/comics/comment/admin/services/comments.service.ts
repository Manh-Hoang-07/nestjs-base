import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ComicComment, Prisma } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { ICommentRepository, COMMENT_REPOSITORY } from '../../domain/comment.repository';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { IPaginationOptions } from '@/common/core/repositories';
import { RequestContext } from '@/common/shared/utils/request-context.util';
import { verifyGroupOwnership } from '@/common/shared/utils/group-ownership.util';

@Injectable()
export class CommentsService extends BaseService<ComicComment, ICommentRepository> {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    protected readonly commentRepository: ICommentRepository,
  ) {
    super(commentRepository);
  }

  /**
   * Hook: Chuẩn bị filters.
   * Mặc định chỉ lấy root comments (level 1)
   */
  protected override async prepareFilters(filters: Record<string, any> = {}, _options?: any): Promise<Record<string, any>> {
    const prepared = { ...filters };

    // Mặc định chỉ lấy root comments (level 1) if parent_id is not specified
    if (prepared.parent_id !== undefined) {
      if (prepared.parent_id === null || prepared.parent_id === 'null') {
        prepared.parent_id = null;
      } else {
        prepared.parent_id = Number(prepared.parent_id);
      }
    } else {
      prepared.parent_id = null;
    }

    // Xử lý search content
    if (prepared.search) {
      (prepared as any).content = { contains: prepared.search };
      delete prepared.search;
    }

    // Xử lý date range
    if (prepared.date_from || prepared.date_to) {
      (prepared as any).created_at = {};
      if (prepared.date_from) {
        prepared.created_at.gte = new Date(prepared.date_from);
        delete prepared.date_from;
      }
      if (prepared.date_to) {
        prepared.created_at.lte = new Date(prepared.date_to);
        delete prepared.date_to;
      }
    }

    // Gán group_id từ RequestContext
    if (prepared.group_id === undefined) {
      Object.assign(prepared, this.getGroupFilter());
    }

    return prepared;
  }

  /**
   * Hook: Chuẩn bị options để lấy kèm replies (dạng cây)
   */
  protected override async prepareOptions(options: IPaginationOptions): Promise<IPaginationOptions> {
    const normalized = await super.prepareOptions(options);

    // Thêm include để lấy cấu trúc cây
    (normalized as any).include = {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      comic: {
        select: { id: true, title: true, slug: true }
      },
      chapter: {
        select: { id: true, title: true, chapter_index: true }
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            }
          }
        }
      }
    };

    return normalized;
  }

  /**
   * Override getOne để lấy kèm relations tương tự getList
   */
  override async getOne(id: string | number | bigint, options: IPaginationOptions = {}): Promise<ComicComment> {
    // Inject include vào options cho repository.findById xử lý (nếu repository hỗ trợ)
    // Hoặc gọi trực tiếp repository findOne với include
    const include = {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      comic: {
        select: { id: true, title: true, slug: true }
      },
      chapter: {
        select: { id: true, title: true, chapter_index: true }
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            }
          }
        }
      }
    };

    const entity = await (this.repository as any).delegate.findFirst({
      where: { id: (this.repository as any).toPrimaryKey(id) },
      include
    });

    if (!entity) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Kiểm tra quyền sở hữu qua comic
    if (entity.comic) {
      verifyGroupOwnership(entity.comic as any);
    }

    return this.transform(entity) as ComicComment;
  }

  /**
   * Lấy thống kê comment
   */
  async getStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [total, visible, hidden, todayCount, thisWeekCount, thisMonthCount] = await Promise.all([
      this.repository.count({}),
      this.repository.count({ status: 'visible' }),
      this.repository.count({ status: 'hidden' }),
      this.repository.count({
        date_from: today,
      }),
      this.repository.count({
        date_from: startOfWeek,
      }),
      this.repository.count({
        date_from: startOfMonth,
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

  protected override async beforeUpdate(id: string | number | bigint, data: any): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Kiểm tra quyền sở hữu qua comic
    const comment = await (this.repository as any).delegate.findFirst({
      where: { id: (this.repository as any).toPrimaryKey(id) },
      include: { comic: true }
    });
    if (comment?.comic) {
      verifyGroupOwnership(comment.comic as any);
    }

    return data;
  }

  protected override async beforeDelete(id: string | number | bigint): Promise<boolean> {
    const comment = await (this.repository as any).delegate.findFirst({
      where: { id: (this.repository as any).toPrimaryKey(id) },
      include: { comic: true }
    });
    if (comment?.comic) {
      verifyGroupOwnership(comment.comic as any);
    }
    return true;
  }
}


