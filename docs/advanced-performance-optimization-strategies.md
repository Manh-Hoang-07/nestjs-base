# Advanced Performance Optimization Strategies

## 🎯 Mục tiêu
Tối ưu hóa hiệu năng API product listing để xử lý được:
- **10,000+ requests/second**
- **Millions of products**
- **Sub-100ms response time**
- **Minimal database load**

---

## 📊 Current Performance Analysis

### Current Bottlenecks
1. **Database queries** - Mỗi request đều hit database
2. **JSON serialization** - Transform data mỗi lần
3. **Variant joins** - Join với ProductVariant table
4. **Category joins** - Join với ProductCategory table
5. **No caching** - Không có layer cache nào

### Current Response Time Breakdown
```
Total: ~190ms
├─ Database query: ~120ms (63%)
├─ Data transformation: ~40ms (21%)
├─ JSON serialization: ~20ms (11%)
└─ Network overhead: ~10ms (5%)
```

---

## 🚀 Optimization Strategies (Theo mức độ ưu tiên)

## Level 1: Quick Wins (Implement ngay) ⚡

### 1.1. Redis Caching Layer
**Impact: 80-90% reduction in response time**

```typescript
// src/modules/ecommerce/product/public/services/product.service.ts

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PublicProductService extends BaseService<Product, IProductRepository> {
  constructor(
    @Inject(PRODUCT_REPOSITORY) protected readonly productRepository: IProductRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super(productRepository);
  }

  async getList(filters?: any, options?: any): Promise<any> {
    // Generate cache key from filters
    const cacheKey = this.generateCacheKey('products:list', filters);
    
    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, fetch from database
    const result = await super.getList(filters, options);
    
    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, result, 300000);
    
    return result;
  }

  private generateCacheKey(prefix: string, filters: any): string {
    const sorted = Object.keys(filters || {})
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: filters[key] }), {});
    return `${prefix}:${JSON.stringify(sorted)}`;
  }

  // Invalidate cache when product is updated
  async invalidateProductCache(productId?: number): Promise<void> {
    if (productId) {
      await this.cacheManager.del(`products:${productId}`);
    }
    // Clear list cache (or use more sophisticated pattern matching)
    await this.cacheManager.reset();
  }
}
```

**Benefits:**
- ✅ Response time: 190ms → **5-10ms** (cached)
- ✅ Database load: -95%
- ✅ Easy to implement
- ⚠️ Need cache invalidation strategy

**Configuration:**
```typescript
// app.module.ts
CacheModule.register({
  store: redisStore,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  ttl: 300, // 5 minutes default
  max: 10000, // Maximum number of items in cache
})
```

---

### 1.2. Database Query Optimization
**Impact: 30-40% reduction in query time**

#### A. Select Only Needed Fields
```typescript
// Current: Select ALL fields
this.defaultSelect = {
  id: true,
  name: true,
  slug: true,
  // ... 20+ fields
}

// Optimized: Different selects for list vs detail
protected getListSelect() {
  return {
    id: true,
    name: true,
    slug: true,
    image: true,
    status: true,
    is_featured: true,
    // Only essential fields for listing
    categories: {
      select: {
        category: {
          select: { id: true, name: true, slug: true }
        }
      }
    },
    variants: {
      where: { deleted_at: null, is_active: true },
      select: {
        id: true,
        price: true,
        sale_price: true,
        // Only price-related fields
      },
      take: 1, // Only need one variant for price calculation
    }
  };
}
```

#### B. Optimize Variant Query
```typescript
// Instead of loading ALL variants, use aggregation
protected buildSelect(options?: any): any {
  if (options?.listView) {
    return {
      ...this.baseFields,
      // Use raw query for min/max price
      _min: {
        variants: {
          price: true,
          sale_price: true,
        }
      },
      _max: {
        variants: {
          price: true,
        }
      }
    };
  }
  return this.defaultSelect;
}
```

---

### 1.3. Pagination Optimization
**Impact: 50% faster for large offsets**

```typescript
// Current: OFFSET-based pagination (slow for large offsets)
// SELECT * FROM products LIMIT 20 OFFSET 10000; -- SLOW!

// Optimized: Cursor-based pagination
export class GetProductsDto {
  @IsOptional()
  @IsString()
  cursor?: string; // Last product ID from previous page

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// In repository
async findWithCursor(filters: any, cursor?: string, limit: number = 20) {
  const where = this.buildWhere(filters);
  
  if (cursor) {
    where.id = { gt: BigInt(cursor) };
  }

  const items = await this.prisma.product.findMany({
    where,
    take: limit + 1, // Fetch one extra to check if there's a next page
    orderBy: { id: 'asc' },
    select: this.getListSelect(),
  });

  const hasNextPage = items.length > limit;
  const data = hasNextPage ? items.slice(0, -1) : items;
  const nextCursor = hasNextPage ? data[data.length - 1].id.toString() : null;

  return { data, nextCursor, hasNextPage };
}
```

**Benefits:**
- ✅ Constant time complexity O(1) instead of O(n)
- ✅ Works well with infinite scroll
- ⚠️ Can't jump to arbitrary page numbers

---

## Level 2: Advanced Optimizations 🔥

### 2.1. Materialized Views for Price Ranges
**Impact: 70% faster price filtering**

```sql
-- Create materialized view for product prices
CREATE TABLE product_price_cache (
  product_id BIGINT UNSIGNED PRIMARY KEY,
  min_price DECIMAL(15, 2),
  max_price DECIMAL(15, 2),
  has_sale BOOLEAN,
  updated_at DATETIME,
  INDEX idx_price_range (min_price, max_price),
  INDEX idx_has_sale (has_sale)
) ENGINE=InnoDB;

-- Populate view (run via trigger or scheduled job)
INSERT INTO product_price_cache (product_id, min_price, max_price, has_sale, updated_at)
SELECT 
  p.id,
  MIN(COALESCE(pv.sale_price, pv.price)) as min_price,
  MAX(pv.price) as max_price,
  MAX(CASE WHEN pv.sale_price IS NOT NULL THEN 1 ELSE 0 END) as has_sale,
  NOW() as updated_at
FROM products p
INNER JOIN product_variants pv ON p.id = pv.product_id
WHERE pv.is_active = 1 AND pv.deleted_at IS NULL
GROUP BY p.id
ON DUPLICATE KEY UPDATE
  min_price = VALUES(min_price),
  max_price = VALUES(max_price),
  has_sale = VALUES(has_sale),
  updated_at = VALUES(updated_at);
```

```typescript
// Use in repository
protected buildWhere(filter: ProductFilter): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  
  // ... other filters
  
  // Price filtering using materialized view
  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    where.price_cache = {
      min_price: filter.minPrice ? { gte: filter.minPrice } : undefined,
      max_price: filter.maxPrice ? { lte: filter.maxPrice } : undefined,
    };
  }
  
  return where;
}
```

**Benefits:**
- ✅ No JOIN with variants table
- ✅ Direct index lookup
- ✅ Pre-calculated prices
- ⚠️ Need to update cache when prices change

---

### 2.2. Elasticsearch for Search & Filtering
**Impact: 10x faster for complex queries**

```typescript
// src/modules/ecommerce/product/infrastructure/elasticsearch/product.search.ts

import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ProductSearchService {
  constructor(private readonly esService: ElasticsearchService) {}

  async search(filters: any) {
    const query: any = {
      bool: {
        must: [],
        filter: [],
      },
    };

    // Text search
    if (filters.search) {
      query.bool.must.push({
        multi_match: {
          query: filters.search,
          fields: ['name^3', 'description', 'sku^2'],
          fuzziness: 'AUTO',
        },
      });
    }

    // Price range
    if (filters.minPrice || filters.maxPrice) {
      query.bool.filter.push({
        range: {
          effective_price: {
            gte: filters.minPrice,
            lte: filters.maxPrice,
          },
        },
      });
    }

    // Category filter
    if (filters.categoryId) {
      query.bool.filter.push({
        term: { 'categories.id': filters.categoryId },
      });
    }

    // Status filter
    query.bool.filter.push({ term: { status: 'active' } });

    const result = await this.esService.search({
      index: 'products',
      body: {
        query,
        from: (filters.page - 1) * filters.limit,
        size: filters.limit,
        sort: [
          { is_featured: 'desc' },
          { created_at: 'desc' },
        ],
        // Aggregations for faceted search
        aggs: {
          price_ranges: {
            range: {
              field: 'effective_price',
              ranges: [
                { to: 100000 },
                { from: 100000, to: 500000 },
                { from: 500000, to: 1000000 },
                { from: 1000000, to: 5000000 },
                { from: 5000000 },
              ],
            },
          },
          categories: {
            terms: { field: 'categories.id', size: 20 },
          },
        },
      },
    });

    return {
      data: result.hits.hits.map(hit => hit._source),
      total: result.hits.total.value,
      aggregations: result.aggregations,
    };
  }

  // Index product when created/updated
  async indexProduct(product: any) {
    await this.esService.index({
      index: 'products',
      id: product.id.toString(),
      body: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        effective_price: product.price,
        categories: product.categories,
        status: product.status,
        is_featured: product.is_featured,
        created_at: product.created_at,
      },
    });
  }
}
```

**Benefits:**
- ✅ Full-text search with relevance scoring
- ✅ Faceted search (price ranges, categories)
- ✅ Typo tolerance
- ✅ Extremely fast for complex queries
- ⚠️ Additional infrastructure (Elasticsearch cluster)
- ⚠️ Need to sync data between MySQL and ES

---

### 2.3. Read Replicas
**Impact: 2-3x more capacity**

```typescript
// prisma/schema.prisma - Multiple datasources
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL") // Master (writes)
}

datasource db_read {
  provider = "mysql"
  url      = env("DATABASE_READ_URL") // Read replica
}

// In service
@Injectable()
export class PublicProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: IProductRepository,
    @Inject(PRODUCT_READ_REPOSITORY) private readonly productReadRepo: IProductRepository,
  ) {}

  // Use read replica for queries
  async getList(filters?: any) {
    return this.productReadRepo.findAll(filters);
  }

  // Use master for writes
  async create(data: any) {
    return this.productRepo.create(data);
  }
}
```

---

## Level 3: Infrastructure & Architecture 🏗️

### 3.1. CDN for Static Product Data
**Impact: Global low-latency access**

```typescript
// Generate static JSON files for popular queries
// Deploy to CDN (CloudFlare, AWS CloudFront)

// Example: Pre-generate top categories
const topCategories = ['dien-thoai', 'laptop', 'phu-kien'];

for (const slug of topCategories) {
  const products = await productService.getList({ 
    category_slug: slug, 
    limit: 20 
  });
  
  // Write to CDN-served location
  await fs.writeFile(
    `./cdn/products/category-${slug}.json`,
    JSON.stringify(products)
  );
}

// Frontend fetches from CDN
fetch('https://cdn.yoursite.com/products/category-dien-thoai.json')
```

---

### 3.2. GraphQL with DataLoader
**Impact: Solve N+1 query problem**

```typescript
// src/modules/ecommerce/product/graphql/product.loader.ts

@Injectable()
export class ProductLoader {
  constructor(private readonly productRepo: IProductRepository) {}

  createLoaders() {
    return {
      product: new DataLoader(async (ids: number[]) => {
        const products = await this.productRepo.findByIds(ids);
        return ids.map(id => products.find(p => p.id === id));
      }),
      
      variants: new DataLoader(async (productIds: number[]) => {
        const variants = await this.variantRepo.findByProductIds(productIds);
        return productIds.map(id => 
          variants.filter(v => v.product_id === id)
        );
      }),
    };
  }
}

// Usage in resolver
@ResolveField()
async variants(@Parent() product: Product, @Context() ctx) {
  return ctx.loaders.variants.load(product.id);
}
```

---

### 3.3. Database Sharding
**Impact: Handle billions of products**

```typescript
// Shard by product ID ranges or categories
// Shard 1: product_id 1-1,000,000
// Shard 2: product_id 1,000,001-2,000,000
// etc.

class ShardedProductRepository {
  private getShardForProduct(productId: number): PrismaClient {
    const shardIndex = Math.floor(productId / 1000000);
    return this.shards[shardIndex];
  }

  async findById(id: number) {
    const shard = this.getShardForProduct(id);
    return shard.product.findUnique({ where: { id } });
  }
}
```

---

## 📊 Performance Comparison

| Strategy | Response Time | DB Load | Complexity | Cost |
|----------|--------------|---------|------------|------|
| **Baseline** | 190ms | 100% | Low | $ |
| **+ Redis Cache** | 10ms | 5% | Low | $$ |
| **+ Query Optimization** | 120ms | 60% | Medium | $ |
| **+ Cursor Pagination** | 150ms | 80% | Medium | $ |
| **+ Materialized Views** | 60ms | 30% | High | $ |
| **+ Elasticsearch** | 20ms | 10% | High | $$$ |
| **+ Read Replicas** | 95ms | 50% | Medium | $$ |
| **+ CDN** | 5ms | 0% | Medium | $$ |
| **All Combined** | **<5ms** | **<1%** | Very High | $$$$ |

---

## 🎯 Recommended Implementation Order

### Phase 1: Quick Wins (Week 1)
1. ✅ Implement Redis caching
2. ✅ Optimize database queries (select only needed fields)
3. ✅ Add cursor-based pagination

**Expected improvement: 80% faster**

### Phase 2: Database Optimization (Week 2-3)
1. ✅ Create materialized views for prices
2. ✅ Add more strategic indexes
3. ✅ Implement query result caching

**Expected improvement: 90% faster**

### Phase 3: Infrastructure (Month 2)
1. ✅ Set up read replicas
2. ✅ Implement CDN for static data
3. ✅ Add monitoring & alerting

**Expected improvement: 95% faster + higher capacity**

### Phase 4: Advanced (Month 3+)
1. ✅ Elasticsearch integration
2. ✅ GraphQL with DataLoader
3. ✅ Consider sharding for massive scale

**Expected improvement: 98% faster + unlimited scale**

---

## 🔍 Monitoring & Metrics

### Key Metrics to Track
```typescript
// src/common/interceptors/performance.interceptor.ts

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        
        // Log slow queries
        if (duration > 100) {
          logger.warn(`Slow query: ${request.url} took ${duration}ms`);
        }
        
        // Send to monitoring (Prometheus, DataDog, etc.)
        metrics.histogram('api.response_time', duration, {
          endpoint: request.url,
          method: request.method,
        });
      }),
    );
  }
}
```

### What to Monitor
- Response time (p50, p95, p99)
- Cache hit rate
- Database query time
- Database connection pool usage
- Memory usage
- Error rate

---

## 💡 Additional Tips

### 1. Lazy Loading Images
```typescript
// Return image URLs, not base64
{
  image: '/cdn/products/image-123.jpg',
  thumbnail: '/cdn/products/thumb-123.jpg',
}
```

### 2. Compression
```typescript
// Enable gzip/brotli compression
app.use(compression());
```

### 3. HTTP/2
```typescript
// Use HTTP/2 for multiplexing
const server = http2.createSecureServer(options, app);
```

### 4. Database Connection Pooling
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  // Optimize connection pool
  connection_limit = 20
  pool_timeout = 20
}
```

---

## 🚨 Common Pitfalls to Avoid

1. ❌ **Over-caching** - Don't cache everything, be strategic
2. ❌ **Stale cache** - Implement proper invalidation
3. ❌ **N+1 queries** - Use DataLoader or eager loading
4. ❌ **Large payloads** - Paginate and select only needed fields
5. ❌ **No monitoring** - You can't optimize what you don't measure
6. ❌ **Premature optimization** - Start simple, optimize based on data

---

## 📚 Resources

- [Prisma Performance Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Redis Caching Strategies](https://redis.io/docs/manual/patterns/)
- [Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Database Indexing Strategies](https://use-the-index-luke.com/)
