import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Comic, ComicStatus } from '@prisma/client';
import { BaseService } from '@/common/core/services';
import { IComicRepository, COMIC_REPOSITORY } from '../../domain/comic.repository';
import { RequestContext } from '@/common/shared/utils';
import { PUBLIC_COMIC_STATUSES } from '@/shared/enums';
import { IFollowRepository, FOLLOW_REPOSITORY } from '@/modules/comics/follow/domain/follow.repository';

@Injectable()
export class PublicComicsService extends BaseService<Comic, IComicRepository> {
  constructor(
    @Inject(COMIC_REPOSITORY)
    protected readonly comicRepository: IComicRepository,
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: IFollowRepository,
  ) {
    super(comicRepository);
  }

  protected override async prepareFilters(filters?: any) {
    const groupId = RequestContext.get<number>('groupId');
    const prepared: any = { ...(filters || {}) };

    if (!prepared.status) {
      prepared.status = { in: PUBLIC_COMIC_STATUSES };
    }

    if (groupId) {
      prepared.group_id = groupId;
    }

    // Map comic_category_id to categoryId (Repo handles categoryId)
    if (prepared.comic_category_id) {
      prepared.categoryId = prepared.comic_category_id;
      delete prepared.comic_category_id;
    }

    return prepared;
  }

  protected override async prepareOptions(options: any = {}) {
    const base = await super.prepareOptions(options);

    // Default includes for public comics
    const defaultInclude = {
      categoryLinks: {
        include: {
          category: true,
        },
      },
      chapters: {
        where: { status: 'published' },
        orderBy: { chapter_index: 'desc' },
        take: 1,
      },
      stats: true,
    };

    return {
      ...base,
      include: options?.include ?? defaultInclude,
    };
  }

  protected override transform(entity: any): any {
    if (!entity) return null;

    const transformed: any = { ...entity };

    // Map categoryLinks to categories
    if (transformed.categoryLinks && Array.isArray(transformed.categoryLinks)) {
      transformed.categories = transformed.categoryLinks
        .map((link: any) => link?.category)
        .filter(Boolean);
      delete transformed.categoryLinks;
    }

    // Map chapters array to last_chapter
    if (transformed.chapters && Array.isArray(transformed.chapters)) {
      const lastChapter = transformed.chapters[0];
      if (lastChapter) {
        transformed.last_chapter = {
          id: lastChapter.id,
          title: lastChapter.title,
          chapter_index: lastChapter.chapter_index,
          chapter_label: lastChapter.chapter_label,
          created_at: lastChapter.created_at,
        };
      }
      delete transformed.chapters;
    }

    // Convert BigInts
    return this.deepConvertBigInt(transformed);
  }

  protected override async afterGetOne(entity: any): Promise<any> {
    const transformed = this.transform(entity);
    if (!transformed) return null;

    // Check follow status if user is logged in
    const userId = RequestContext.get<number>('userId');
    if (userId) {
      transformed.is_following = await this.followRepository.exists({
        user_id: userId,
        comic_id: entity.id,
      });
    } else {
      transformed.is_following = false;
    }

    return transformed;
  }

  /**
   * Get comic by slug
   */
  async getBySlug(slug: string) {
    const groupId = RequestContext.get<number>('groupId');
    const filters: any = { slug };
    if (groupId) filters.group_id = groupId;

    const comic = await this.comicRepository.findOne(filters);

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    return this.getOne(comic.id);
  }

  /**
   * Get chapters by comic slug
   */
  async getChaptersBySlug(slug: string, options: any = {}) {
    const groupId = RequestContext.get<number>('groupId');
    const filters: any = { slug };
    if (groupId) filters.group_id = groupId;

    const comic = await this.comicRepository.findOne(filters);

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    // Increment view count khi xem danh sách chapter (tùy logic)
    await this.comicRepository.incrementView(comic.id);

    return this.comicRepository.getChapters(comic.id, options);
  }
}
