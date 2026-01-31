import { Injectable, Inject } from '@nestjs/common';
import { BaseService } from '@/common/core/services/base.service';
import { Comic } from '@prisma/client';
import { IComicRepository, COMIC_REPOSITORY } from '../../domain/comic.repository';
import { PUBLIC_CHAPTER_STATUSES, PUBLIC_COMIC_STATUSES } from '@/shared/enums';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { FollowsService } from '@/modules/comics/follow/user/services/follows.service';
import { RequestContext } from '@/common/shared/utils';

@Injectable()
export class PublicComicsService extends BaseService<Comic, IComicRepository> {
  constructor(
    @Inject(COMIC_REPOSITORY) protected readonly repository: IComicRepository,
    private readonly prisma: PrismaService,
    private readonly followsService: FollowsService,
  ) {
    super(repository);
  }

  protected override async prepareFilters(filters?: any) {
    const prepared: any = { ...(filters || {}) };

    // Luôn giới hạn comics ở trạng thái public
    prepared.status = { in: PUBLIC_COMIC_STATUSES };

    // Map comic_category_id to categoryId (Repo handles categoryId)
    if (prepared.comic_category_id) {
      prepared.categoryId = prepared.comic_category_id;
      delete prepared.comic_category_id;
    }

    return prepared;
  }

  protected override async prepareOptions(options: any = {}) {
    // Note: super.prepareOptions handles page/limit/sort normalization
    const base = await super.prepareOptions(options);

    const allowStatsSort = ['view_count', 'follow_count'];
    const allowDirectSort = ['last_chapter_updated_at', 'created_at', 'updated_at'];
    const [sortFieldRaw, sortDirRaw] = String(base.sort || '').split(':');
    const sortField = sortFieldRaw || '';
    const sortDirection =
      (sortDirRaw || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    let orderBy;
    if (allowStatsSort.includes(sortField)) {
      orderBy = {
        stats: {
          [sortField]: sortDirection,
        },
      };
    } else if (allowDirectSort.includes(sortField)) {
      orderBy = {
        [sortField]: sortDirection,
      };
    } else {
      // So if we put `orderBy` in the returned options, does `PrismaRepository` use it?
      // `PrismaRepository.findAll` does: `const orderBy = this.parseSort(sort);`
      // It DOES NOT look at `options.orderBy`.
      // To force a custom orderBy, we might need to modify `options.sort` or `Repo` logic.
      // BUT, `PrismaRepository` accepts `orderBy` in `delegate.findMany`.
      // Wait, `PrismaRepository.findAll` calls: `this.delegate.findMany({ ..., orderBy, ... })`.
      // The local `orderBy` variable shadows anything passed in arguments.
    }
    // Note: base.orderBy does not exist on IPaginationOptions

    // Prisma không cho phép dùng select + include cùng lúc
    // Ưu tiên: include > select > defaultSelect
    const defaultSelect = {
      id: true,
      slug: true,
      title: true,
      description: true,
      cover_image: true,
      author: true,
      categoryLinks: {
        select: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      stats: {
        select: {
          view_count: true,
          follow_count: true,
          rating_count: true,
          rating_sum: true,
        },
      },
      // Lấy chapter mới nhất (theo chapter_index)
      chapters: {
        take: 1,
        orderBy: { chapter_index: 'desc' as const },
        select: {
          id: true,
          title: true,
          chapter_index: true,
          chapter_label: true,
          created_at: true,
        },
      },
    };

    // Nếu có include trong options, dùng include và bỏ select
    if (options?.include) {
      return {
        ...base,
        include: options.include,
        select: undefined,
      };
    }

    // Nếu không có include, dùng select
    const finalSelect = options?.select ?? defaultSelect;
    return {
      ...base,
      select: finalSelect,
      include: undefined,
    };
  }

  protected override async afterGetList(result: any) {
    // result is IPaginatedResult<Comic>
    const data = result.data.map((comic: any) => {
      // Map categoryLinks sang categories
      const categories = comic.categoryLinks?.map((l: any) => l.category).filter(Boolean) ?? [];

      // Transform chapters array thành last_chapter object
      const lastChapter = comic.chapters?.[0];

      const {
        categoryLinks,
        chapters,
        created_user_id,
        updated_user_id,
        created_at,
        deleted_at,
        status,
        ...rest
      } = comic;

      return {
        ...rest,
        categories,
        ...(lastChapter && {
          last_chapter: {
            id: lastChapter.id,
            title: lastChapter.title,
            chapter_index: lastChapter.chapter_index,
            chapter_label: lastChapter.chapter_label,
            created_at: lastChapter.created_at,
          },
        }),
      };
    });

    return {
      ...result,
      data,
    };
  }

  protected override async afterGetOne(comic: any) {
    if (!comic) return null;

    // Map categoryLinks sang categories
    const categories = comic.categoryLinks?.map((l: any) => l.category).filter(Boolean) ?? [];

    // Transform chapters array thành last_chapter object
    const lastChapter = comic.chapters?.[0];

    const {
      categoryLinks,
      chapters,
      created_user_id,
      updated_user_id,
      created_at,
      deleted_at,
      status,
      ...rest
    } = comic;

    // Check nếu user đã đăng nhập thì thêm thông tin follow
    let isFollowing = false;
    const userId = RequestContext.get<number>('userId');
    if (userId) {
      try {
        const comicId = typeof rest.id === 'bigint' ? Number(rest.id) : rest.id;
        isFollowing = await this.followsService.isFollowing(comicId);
      } catch (error) {
        isFollowing = false;
      }
    }

    return {
      ...rest,
      categories,
      ...(lastChapter && {
        last_chapter: {
          id: lastChapter.id,
          title: lastChapter.title,
          chapter_index: lastChapter.chapter_index,
          chapter_label: lastChapter.chapter_label,
          created_at: lastChapter.created_at,
        },
      }),
      is_following: isFollowing,
    };
  }

  async getBySlug(slug: string) {
    // Query manually using Prisma to support custom select/include
    const options = await this.prepareOptions({}) as any;

    const args: any = { where: { slug } };
    if (options.select) {
      args.select = options.select;
    } else if (options.include) {
      args.include = options.include;
    }

    const comic = await this.prisma.comic.findUnique(args);

    if (!comic) return null;
    return this.afterGetOne(this.deepConvertBigInt(comic));
  }

  async getChaptersBySlug(slug: string) {
    const comic = await this.repository.findBySlug(slug);
    if (!comic) return [];

    const chapters = await this.prisma.chapter.findMany({
      where: { comic_id: comic.id, status: PUBLIC_CHAPTER_STATUSES[0] },
      orderBy: { chapter_index: 'asc' },
      select: {
        id: true,
        title: true,
        chapter_index: true,
        chapter_label: true,
        view_count: true,
        created_at: true,
      },
    });
    return this.deepConvertBigInt(chapters);
  }
}

