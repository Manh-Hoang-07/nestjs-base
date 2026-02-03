import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ComicFollow } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IFollowRepository, FOLLOW_REPOSITORY } from '../../domain/follow.repository';
import { RequestContext } from '@/common/shared/utils';

@Injectable()
export class FollowsService extends BaseService<ComicFollow, IFollowRepository> {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    protected readonly followRepository: IFollowRepository,
  ) {
    super(followRepository);
  }

  /**
   * Automatic user ID filtering
   */
  protected override async prepareFilters(filters?: any) {
    const userId = RequestContext.get<number>('userId');
    return {
      ...(filters || {}),
      user_id: userId,
    };
  }

  async follow(comicId: number | bigint) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) throw new UnauthorizedException();

    const existing = await this.repository.findOne({
      user_id: userId,
      comic_id: comicId,
    });

    if (existing) return this.transform(existing);

    const saved = await this.repository.create({
      user_id: userId,
      comic_id: comicId,
    });

    await this.followRepository.syncFollowCount(comicId);
    return this.transform(saved);
  }

  async unfollow(comicId: number | bigint) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) throw new UnauthorizedException();

    await this.repository.deleteMany({
      user_id: userId,
      comic_id: comicId,
    });

    await this.followRepository.syncFollowCount(comicId);
    return { success: true };
  }

  async isFollowing(comicId: number | bigint): Promise<boolean> {
    const userId = RequestContext.get<number>('userId');
    if (!userId) return false;

    return this.repository.exists({
      user_id: userId,
      comic_id: comicId,
    });
  }

  /**
   * Specific transformation for follows
   */
  protected override transform(entity: any): any {
    return this.deepConvertBigInt(entity);
  }
}



