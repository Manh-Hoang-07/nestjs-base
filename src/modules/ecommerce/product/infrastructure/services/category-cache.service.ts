import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { CacheService } from '@/common/cache/services';

/**
 * Category cache service
 * Uses existing CacheService infrastructure (Redis if available, or in-memory)
 * Category slugs rarely change, so this is very safe to cache
 */
@Injectable()
export class CategoryCacheService {
    private readonly logger = new Logger(CategoryCacheService.name);
    private readonly CACHE_PREFIX = 'category:slug:';
    private readonly CACHE_ALL_KEY = 'category:all';
    private readonly CACHE_TTL = 3600000; // 1 hour (in ms)

    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
    ) { }

    /**
     * Get category ID by slug (with caching)
     */
    async getCategoryIdBySlug(slug: string): Promise<bigint | null> {
        const cacheKey = `${this.CACHE_PREFIX}${slug}`;

        return this.cacheService.getOrSet(
            cacheKey,
            async () => {
                const category = await this.prisma.productCategory.findUnique({
                    where: { slug, deleted_at: null },
                    select: { id: true },
                });
                return category?.id || null;
            },
            this.CACHE_TTL,
        );
    }

    /**
     * Get multiple category IDs by slugs
     */
    async getCategoryIdsBySlugs(slugs: string[]): Promise<Map<string, bigint>> {
        const result = new Map<string, bigint>();

        // Try to get from cache first
        await Promise.all(
            slugs.map(async (slug) => {
                const id = await this.getCategoryIdBySlug(slug);
                if (id) {
                    result.set(slug, id);
                }
            })
        );

        return result;
    }

    /**
     * Get all categories (cached)
     */
    async getAllCategories(): Promise<Array<{ id: bigint; slug: string; name: string }>> {
        return this.cacheService.getOrSet(
            this.CACHE_ALL_KEY,
            async () => {
                return this.prisma.productCategory.findMany({
                    where: { deleted_at: null },
                    select: { id: true, slug: true, name: true },
                });
            },
            this.CACHE_TTL,
        );
    }

    /**
     * Invalidate specific category from cache
     */
    async invalidateCategory(slug: string): Promise<void> {
        const cacheKey = `${this.CACHE_PREFIX}${slug}`;
        await this.cacheService.del(cacheKey);
        this.logger.debug(`Invalidated cache for category: ${slug}`);
    }

    /**
     * Clear entire category cache
     */
    async clearCache(): Promise<void> {
        await this.cacheService.deletePattern(`${this.CACHE_PREFIX}*`);
        await this.cacheService.del(this.CACHE_ALL_KEY);
        this.logger.log('Category cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheInfo() {
        return {
            prefix: this.CACHE_PREFIX,
            ttl: this.CACHE_TTL,
            allKey: this.CACHE_ALL_KEY,
        };
    }
}
