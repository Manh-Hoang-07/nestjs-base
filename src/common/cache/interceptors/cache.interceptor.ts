import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA, CacheOptions } from '@/common/cache/decorators';
import { RedisUtil } from '@/core/utils/redis.util';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisUtil,
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const handler = context.getHandler();
    const request = context.switchToHttp().getRequest();
    const args = context.getArgs();

    // 1. Handle CacheEvict first (if any)
    const evictOptions = this.reflector.get<{ keys: string[] }>(
      'cache:evict',
      handler,
    );

    if (evictOptions && this.redis.isEnabled()) {
      return next.handle().pipe(
        tap(async () => {
          // [H2] Parallel eviction thay vì sequential
          await Promise.all(
            evictOptions.keys.map(async (keyTemplate) => {
              const cacheKey = this.buildCacheKey(keyTemplate, request, args);
              // [C1] Dùng SCAN thay vì KEYS để không block Redis event loop
              if (cacheKey.endsWith('*')) {
                await this.deletePattern(cacheKey);
              } else {
                await this.redis.del(cacheKey);
              }
            }),
          );
        }),
      );
    }

    // 2. Handle Cacheable
    const cacheOptions = this.reflector.get<CacheOptions>(
      CACHE_TTL_METADATA,
      handler,
    );

    if (!cacheOptions || !this.redis.isEnabled()) {
      return next.handle();
    }

    // Build cache key from template and method arguments
    const cacheKey = this.buildCacheKey(
      cacheOptions.key,
      request,
      args,
    );

    // Try to get from cache
    const cachedValue = await this.redis.get(cacheKey);
    if (cachedValue !== null) {
      try {
        return of(JSON.parse(cachedValue));
      } catch {
        // If parse fails, return as-is
        return of(cachedValue);
      }
    }

    // Execute method and cache result
    return next.handle().pipe(
      tap(async (data) => {
        // Don't cache null/undefined unless explicitly allowed
        if (data === null || data === undefined) {
          if (!cacheOptions.cacheNull) {
            return;
          }
        }

        try {
          await this.redis.set(
            cacheKey,
            JSON.stringify(data),
            cacheOptions.ttl,
          );
        } catch (error) {
          // Log error but don't fail the request
        }
      }),
    );
  }

  /**
   * [C1] Delete by pattern — dùng SCAN thay vì KEYS để không block Redis
   */
  private async deletePattern(pattern: string): Promise<void> {
    const keys = await this.redis.scan(pattern); // Non-blocking SCAN iteration
    if (keys.length > 0) {
      // Parallel delete
      await Promise.all(keys.map(k => this.redis.del(k)));
    }
  }

  /**
   * Build cache key from template and parameters.
   * Example: 'product:${id}' with id=123 becomes 'product:123'
   *
   * [H5] Tránh tạo new RegExp() mỗi iteration — dùng simple string replace với
   *      encodeParam để tránh conflict ký tự đặc biệt.
   * [L3] Encode param values để tránh cache key conflict với ký tự đặc biệt.
   */
  private buildCacheKey(template: string, request: any, args: any[]): string {
    let key = template;

    // [H5] Replace ${param} với actual values — dùng replaceAll với string đơn giản
    // cho từng param thay vì new RegExp() để tránh overhead
    const params = request.params || {};
    for (const [paramName, paramValue] of Object.entries(params)) {
      // [L3] Encode value để tránh conflict với ký tự đặc biệt trong cache key
      key = key.split(`\${${paramName}}`).join(this.encodeParam(String(paramValue)));
    }

    // Replace ${query.param} with query values
    const query = request.query || {};
    for (const [queryName, queryValue] of Object.entries(query)) {
      key = key.split(`\${query.${queryName}}`).join(this.encodeParam(String(queryValue)));
    }

    // Replace ${body.param} with body values
    const body = request.body || {};
    for (const [bodyName, bodyValue] of Object.entries(body)) {
      key = key.split(`\${body.${bodyName}}`).join(this.encodeParam(String(bodyValue)));
    }

    // Replace ${args[n]} with method arguments
    args.forEach((arg, index) => {
      key = key.split(`\${args[${index}]}`).join(this.encodeParam(String(arg)));
    });

    return key;
  }

  /**
   * [L3] Encode cache key segment để tránh conflict với ký tự đặc biệt
   * Chỉ giữ lại alphanumeric, dấu gạch ngang, gạch dưới, dấu chấm
   */
  private encodeParam(value: string): string {
    // Thay thế ký tự đặc biệt (khoảng trắng, *, ?, [, ], ...) bằng underscore
    return value.replace(/[^a-zA-Z0-9\-_.]/g, '_');
  }
}
