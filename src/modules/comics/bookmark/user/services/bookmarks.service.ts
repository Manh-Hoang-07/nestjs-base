import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { Bookmark } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IBookmarkRepository, BOOKMARK_REPOSITORY } from '../../domain/bookmark.repository';
import { RequestContext } from '@/common/shared/utils';

@Injectable()
export class BookmarksService extends BaseService<Bookmark, IBookmarkRepository> {
  constructor(
    @Inject(BOOKMARK_REPOSITORY)
    protected readonly bookmarkRepository: IBookmarkRepository,
  ) {
    super(bookmarkRepository);
  }

  protected override async prepareFilters(filters?: any) {
    const userId = RequestContext.get<number>('userId');
    return {
      ...(filters || {}),
      user_id: userId,
    };
  }

  protected override async prepareOptions(options: any = {}) {
    const base = await super.prepareOptions(options);
    return {
      ...base,
      include: options?.include ?? {
        chapter: {
          include: {
            comic: true,
          },
        },
      },
    };
  }

  async createBookmark(chapterId: number | bigint, pageNumber: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) throw new UnauthorizedException();

    const saved = await this.repository.create({
      user_id: userId,
      chapter_id: chapterId,
      page_number: pageNumber,
    });

    return this.getOne(saved.id);
  }

  async removeBookmark(id: number | bigint) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) throw new UnauthorizedException();

    const bookmark = await this.repository.findOne({
      id,
      user_id: userId,
    });

    if (bookmark) {
      await this.repository.delete(id);
    }

    return { success: true };
  }

  protected override transform(entity: any): any {
    return this.deepConvertBigInt(entity);
  }
}





