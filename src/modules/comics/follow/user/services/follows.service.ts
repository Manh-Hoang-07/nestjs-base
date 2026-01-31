import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { RequestContext } from '@/common/utils/request-context.util';
import { toPlain } from '@/common/base/services/prisma/prisma.utils';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getByUser(userId: number) {
    const follows = await this.prisma.comicFollow.findMany({
      where: { user_id: userId },
      include: { comic: true },
      orderBy: { created_at: 'desc' },
    });

    return toPlain(follows);
  }

  async follow(comicId: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const existing = await this.prisma.comicFollow.findFirst({
      where: { user_id: userId, comic_id: comicId },
    });

    if (existing) {
      return toPlain(existing);
    }

    const saved = await this.prisma.comicFollow.create({
      data: {
        user_id: userId,
        comic_id: comicId,
      },
    });

    // Sync follow count
    await this.syncFollowCount(comicId);

    return toPlain(saved);
  }

  async unfollow(comicId: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await this.prisma.comicFollow.deleteMany({
      where: { user_id: userId, comic_id: comicId },
    });

    // Sync follow count
    await this.syncFollowCount(comicId);

    return { deleted: true };
  }

  /**
   * Sync follow count vào comic_stats
   */
  private async syncFollowCount(comicId: number) {
    const followCount = await this.prisma.comicFollow.count({
      where: { comic_id: comicId },
    });

    const stats = await this.prisma.comicStats.findUnique({ where: { comic_id: comicId } });
    if (!stats) {
      await this.prisma.comicStats.create({
        data: {
          comic_id: comicId,
          view_count: 0,
          follow_count: followCount,
          rating_count: 0,
          rating_sum: 0,
        },
      });
    } else {
      await this.prisma.comicStats.update({
        where: { comic_id: comicId },
        data: { follow_count: followCount },
      });
    }
  }

  async isFollowing(comicId: number): Promise<boolean> {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      return false;
    }

    const follow = await this.prisma.comicFollow.findFirst({
      where: { user_id: userId, comic_id: comicId },
    });
    return !!follow;
  }
}

