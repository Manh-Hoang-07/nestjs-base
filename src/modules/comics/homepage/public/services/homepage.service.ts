import { Injectable } from '@nestjs/common';
import { CacheService } from '@/common/cache/services/cache.service';
import { PublicComicsService } from '@/modules/comics/comic/public/services/comic.service';
import { PublicComicCategoriesService } from '@/modules/comics/comic-category/public/services/comic-category.service';

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
  ) { }

  /**
   * Lấy tất cả dữ liệu cần thiết cho trang chủ
   * Mỗi block được cache riêng với TTL khác nhau
   * Sử dụng getList với điều kiện sort thay vì các methods riêng
   */
  async getHomepageData() {
    // Fetch dữ liệu song song
    const [
      topViewedComics,
      popularComics,
      newestComics,
      recentUpdateComics,
      comicCategories,
    ] = await Promise.all([
      // Top viewed comics - cache 7 phút (Dùng chung cho Trending vì logic hiện tại giống nhau)
      this.cacheService.getOrSet(
        this.CACHE_KEYS.TOP_VIEWED,
        async () => {
          const result = await this.comicsService.getList({
            limit: 8,
            sort: 'view_count:DESC',
          });
          return result.data || [];
        },
        this.CACHE_TTL.TOP_VIEWED,
      ),

      // Popular comics
      this.cacheService.getOrSet(
        this.CACHE_KEYS.POPULAR,
        async () => {
          const result = await this.comicsService.getList({
            limit: 8,
            sort: 'follow_count:DESC',
          });
          return result.data || [];
        },
        this.CACHE_TTL.POPULAR,
      ),

      // Newest comics
      this.cacheService.getOrSet(
        this.CACHE_KEYS.NEWEST,
        async () => {
          const result = await this.comicsService.getList({
            limit: 8,
            sort: 'created_at:DESC',
          });
          return result.data || [];
        },
        this.CACHE_TTL.NEWEST,
      ),

      // Recent update comics
      this.cacheService.getOrSet(
        this.CACHE_KEYS.LATEST_CHAPTERS,
        async () => {
          const result = await this.comicsService.getList({
            limit: 8,
            sort: 'last_chapter_updated_at:DESC',
          });
          return result.data || [];
        },
        this.CACHE_TTL.LATEST_CHAPTERS,
      ),

      // Comic categories
      this.cacheService.getOrSet(
        this.CACHE_KEYS.COMIC_CATEGORIES,
        async () => {
          const result = await this.comicCategoriesService.getList({
            limit: 20,
          });
          return result?.data || [];
        },
        this.CACHE_TTL.COMIC_CATEGORIES,
      ),
    ]);

    return {
      top_viewed_comics: topViewedComics,
      trending_comics: topViewedComics, // Tạm thời dùng chung data với top viewed để tiết kiệm query
      popular_comics: popularComics,
      newest_comics: newestComics,
      recent_update_comics: recentUpdateComics,
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

