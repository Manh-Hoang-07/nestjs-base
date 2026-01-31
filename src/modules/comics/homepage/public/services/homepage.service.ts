import { Injectable } from '@nestjs/common';
import { CacheService } from '@/common/services/cache.service';
import { PublicComicsService } from '@/modules/comics/public/comics/services/comics.service';
import { PublicComicCategoriesService } from '@/modules/comics/public/comic-categories/services/comic-categories.service';

@Injectable()
export class HomepageService {
  // Cache keys cho từng block
  private readonly CACHE_KEYS = {
    TOP_VIEWED: 'public:homepage:comics:top_viewed',
    TRENDING: 'public:homepage:comics:trending',
    POPULAR: 'public:homepage:comics:popular',
    NEWEST: 'public:homepage:comics:newest',
    LATEST_CHAPTERS: 'public:homepage:chapters:latest',
    COMIC_CATEGORIES: 'public:homepage:categories:comic',
  };

  // Cache TTL theo từng block (giây)
  private readonly CACHE_TTL = {
    TOP_VIEWED: 420,        // 7 phút - Top viewed thay đổi không quá nhanh
    TRENDING: 420,          // 7 phút - Truyện hot
    POPULAR: 1200,          // 20 phút - Truyện nổi bật (10-30 phút)
    NEWEST: 120,            // 2 phút - Truyện mới (1-3 phút)
    LATEST_CHAPTERS: 120,   // 2 phút - Chapters mới nhất (1-3 phút)
    COMIC_CATEGORIES: 43200, // 12 giờ - Danh mục (1-24 giờ)
  };

  constructor(
    private readonly cacheService: CacheService,
    private readonly comicsService: PublicComicsService,
    private readonly comicCategoriesService: PublicComicCategoriesService,
  ) {}

  /**
   * Lấy tất cả dữ liệu cần thiết cho trang chủ
   * Mỗi block được cache riêng với TTL khác nhau
   * Sử dụng getList với điều kiện sort thay vì các methods riêng
   */
  async getHomepageData() {
    // Fetch tất cả dữ liệu song song với cache riêng cho từng block
    const [
      topViewedComics,
      trendingComics,
      popularComics,
      newestComics,
      recentUpdateComics,
      comicCategories,
    ] = await Promise.all([
      // Top viewed comics - cache 7 phút
      this.cacheService.getOrSet(
        this.CACHE_KEYS.TOP_VIEWED,
        async () => {
          const result = await this.comicsService.getList(
            undefined,
            { limit: 10, sort: 'view_count:DESC' },
          );
          return result.data || [];
        },
        this.CACHE_TTL.TOP_VIEWED,
      ),

      // Trending comics (hot) - cache 7 phút
      // Sử dụng getList với sort view_count:desc
      this.cacheService.getOrSet(
        this.CACHE_KEYS.TRENDING,
        async () => {
          const result = await this.comicsService.getList(
            undefined,
            { limit: 30, sort: 'view_count:DESC' },
          );
          return result.data || [];
        },
        this.CACHE_TTL.TRENDING,
      ),

      // Popular comics (nổi bật) - cache 20 phút
      // Sử dụng getList với sort follow_count:desc
      this.cacheService.getOrSet(
        this.CACHE_KEYS.POPULAR,
        async () => {
          const result = await this.comicsService.getList(
            undefined,
            { limit: 30, sort: 'follow_count:DESC' },
          );
          return result.data || [];
        },
        this.CACHE_TTL.POPULAR,
      ),

      // Newest comics - cache 2 phút
      // Sử dụng getList với sort created_at:desc
      this.cacheService.getOrSet(
        this.CACHE_KEYS.NEWEST,
        async () => {
          const result = await this.comicsService.getList(
            undefined,
            { limit: 30, sort: 'created_at:DESC' },
          );
          return result.data || [];
        },
        this.CACHE_TTL.NEWEST,
      ),

      // Recent update comics - cache 2 phút
      // Lấy comics có chapter mới cập nhật (sort theo last_chapter_updated_at)
      // ✅ Chỉ cần 1 query đơn giản, sort trực tiếp trên comics table!
      this.cacheService.getOrSet(
        this.CACHE_KEYS.LATEST_CHAPTERS,
        async () => {
          const result = await this.comicsService.getList(undefined, {
            limit: 10,
            sort: 'last_chapter_updated_at:DESC', // Sort trực tiếp trên comics table
          });
          return result.data || [];
        },
        this.CACHE_TTL.LATEST_CHAPTERS,
      ),

      // Comic categories - cache 12 giờ
      // Lưu ý: ComicCategory không có field status, chỉ cần lấy list
      this.cacheService.getOrSet(
        this.CACHE_KEYS.COMIC_CATEGORIES,
        async () => {
          const result = await this.comicCategoriesService.getList(
            undefined,
            { limit: 20 },
          );
          return result?.data || [];
        },
        this.CACHE_TTL.COMIC_CATEGORIES,
      ),
    ]);

    return {
      // Truyện được xem nhiều nhất
      top_viewed_comics: topViewedComics,
      // Truyện đang hot (trending)
      trending_comics: trendingComics,
      // Truyện phổ biến (nổi bật)
      popular_comics: popularComics,
      // Truyện mới nhất
      newest_comics: newestComics,
      // Truyện có chapter mới cập nhật
      recent_update_comics: recentUpdateComics,
      // Danh mục truyện
      comic_categories: comicCategories,
    };
  }

  /**
   * Xóa cache của một block cụ thể
   */
  async clearCacheBlock(block: keyof typeof this.CACHE_KEYS): Promise<void> {
    await this.cacheService.del(this.CACHE_KEYS[block]);
  }

  /**
   * Xóa toàn bộ cache của homepage
   */
  async clearAllCache(): Promise<void> {
    await Promise.all(
      Object.values(this.CACHE_KEYS).map((key) =>
        this.cacheService.del(key),
      ),
    );
  }

  /**
   * Xóa cache liên quan đến comics
   */
  async clearComicsCache(): Promise<void> {
    await Promise.all([
      this.cacheService.del(this.CACHE_KEYS.TOP_VIEWED),
      this.cacheService.del(this.CACHE_KEYS.TRENDING),
      this.cacheService.del(this.CACHE_KEYS.POPULAR),
      this.cacheService.del(this.CACHE_KEYS.NEWEST),
    ]);
  }

  /**
   * Xóa cache liên quan đến chapters
   */
  async clearChaptersCache(): Promise<void> {
    await this.cacheService.del(this.CACHE_KEYS.LATEST_CHAPTERS);
  }

  /**
   * Xóa cache liên quan đến categories
   */
  async clearCategoriesCache(): Promise<void> {
    await this.cacheService.del(this.CACHE_KEYS.COMIC_CATEGORIES);
  }
}

