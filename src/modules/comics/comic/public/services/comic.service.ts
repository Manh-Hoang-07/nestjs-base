import { Injectable } from '@nestjs/common';
import { PUBLIC_CHAPTER_STATUSES, PUBLIC_COMIC_STATUSES } from '@/shared/enums';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaListService, PrismaListBag } from '@/common/base/services/prisma/prisma-list.service';
import { buildOrderBy, toPlain } from '@/common/base/services/prisma/prisma.utils';
import { FollowsService } from '@/modules/comics/user/follows/services/follows.service';
import { RequestContext } from '@/common/utils/request-context.util';

type ComicBag = PrismaListBag & {
  Model: any;
  Where: any;
  Select: any;
  Include: any;
  OrderBy: any;
};

@Injectable()
export class PublicComicsService extends PrismaListService<ComicBag> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly followsService: FollowsService,
  ) {
    super(prisma.comic, ['id', 'created_at', 'view_count', 'follow_count'], 'id:DESC');
  }

  protected override async prepareFilters(filters?: any, _options?: any): Promise<any> {
    const prepared: any = { ...(filters || {}) };
    
    // Luôn giới hạn comics ở trạng thái public
    prepared.status = { in: PUBLIC_COMIC_STATUSES };

    // Xử lý comic_category_id filter - chuyển thành relation filter (alias của category_id)
    const comicCategoryId = prepared.comic_category_id;
    if (comicCategoryId) {
      prepared.categoryLinks = {
        some: {
          category: { id: BigInt(comicCategoryId) },
        },
      };
      delete prepared.comic_category_id;
    }

    return prepared;
  }

  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
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
      orderBy = base.orderBy;
    }

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

    // Nếu có include trong queryOptions, dùng include và bỏ select
    if (queryOptions?.include) {
      return {
        ...base,
        include: queryOptions.include,
        select: undefined,
        orderBy,
      };
    }

    // Nếu không có include, dùng select
    const finalSelect = queryOptions?.select ?? defaultSelect;
    return {
      ...base,
      select: finalSelect,
      include: undefined,
      orderBy,
    };
  }

  protected override async afterGetList(data: any[]) {
    return data.map((comic: any) => {
      // Map categoryLinks sang categories
      const categories = comic.categoryLinks?.map((l: any) => l.category).filter(Boolean) ?? [];
      
      // Transform chapters array thành last_chapter object
      const lastChapter = comic.chapters?.[0];
      
      // Unset categoryLinks, chapters và các trường không cần thiết
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
        // Chỉ thêm last_chapter nếu có
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
  }

  protected override async afterGetOne(comic: any) {
    if (!comic) return null;

    // Map categoryLinks sang categories
    const categories = comic.categoryLinks?.map((l: any) => l.category).filter(Boolean) ?? [];
    
    // Transform chapters array thành last_chapter object
    const lastChapter = comic.chapters?.[0];
    
    // Unset categoryLinks, chapters và các trường không cần thiết
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
        // Nếu có lỗi, giữ isFollowing = false
        isFollowing = false;
      }
    }
    
    return {
      ...rest,
      categories,
      // Chỉ thêm last_chapter nếu có
      ...(lastChapter && {
        last_chapter: {
          id: lastChapter.id,
          title: lastChapter.title,
          chapter_index: lastChapter.chapter_index,
          chapter_label: lastChapter.chapter_label,
          created_at: lastChapter.created_at,
        },
      }),
      // Thêm thông tin follow nếu user đã đăng nhập
      is_following: isFollowing,
    };
  }

  async getBySlug(slug: string) {
    return this.getOne({ slug });
  }

  async getChaptersBySlug(slug: string) {
    const comic = await this.prisma.comic.findUnique({
      where: { slug },
      select: { id: true },
    });
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
    return toPlain(chapters);
  }
}

