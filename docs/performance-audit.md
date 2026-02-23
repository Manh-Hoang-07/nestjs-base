# 📊 Performance Audit Report — NestJS Backend

> **Thời điểm đánh giá:** 2026-02-23  
> **Phạm vi:** Toàn bộ source code tại `d:\be\src`  
> **Người đánh giá:** AI Code Review (Antigravity)

---

## 📋 Tổng quan kiến trúc

Project sử dụng **NestJS** + **Prisma ORM** + **MariaDB** + **Redis** theo kiến trúc **Clean Architecture** (Domain / Infrastructure / Application layer). Codebase khá lớn với hơn **842 files**, nhiều module nghiệp vụ (ecommerce, comics, post, marketing...).

---

## ✅ Điểm mạnh về hiệu năng

### 1. Redis Caching Layer đã được triển khai
- `CacheInterceptor` + `@Cacheable` / `@CacheEvict` decorator tự xây đúng hướng.
- Các public endpoints (product-categories, general-config, post...) đã được cache với TTL phù hợp (600–3600s).
- `RedisUtil` có `lazyConnect`, retry strategy với exponential backoff — tốt cho resilience.

### 2. Denormalized price fields (Product)
- `min_effective_price` / `max_effective_price` được lưu thẳng vào bảng `products` → filter theo giá **không cần JOIN** với `variants` → tăng tốc ~10x cho query lọc giá.

### 3. BigInt xử lý tối ưu trong BaseService
- `deepConvertBigInt` dùng `for` loop thay `map` + `Promise.all`, tránh overhead không cần thiết với array lớn.
- Transform loop trong `getList` chỉ `await` khi `transform` thực sự trả về Promise.

### 4. Database indexes đầy đủ
- Hầu hết các model trong `schema.prisma` đều có `@@index([deleted_at])`, composite indexes cho các query phổ biến (ví dụ: `idx_status_published_at`, `idx_is_featured_status`...).

### 5. RBAC caching
- `RbacCacheService` cache permissions per user/group → tránh query DB nhiều bảng cho mỗi request.

### 6. Throttling với Redis backend
- Rate limit 100 req/phút/IP, fallback về in-memory khi Redis không khả dụng — tốt cho production.

### 7. Queue với Bull
- Email notification xử lý qua Bull queue (Redis-backed) → tránh blocking HTTP request thread.

### 8. Graceful shutdown + connection pooling
- `PrismaService` implement `OnModuleInit/OnModuleDestroy`, graceful shutdown hook.

---

## ⚠️ Nhược điểm & Vấn đề hiệu năng

---

### 🔴 CRITICAL

#### C1. `KEYS` command trong Redis (Production-blocking)
**File:** `src/core/utils/redis.util.ts` — line 76  
**File:** `src/common/cache/interceptors/cache.interceptor.ts` — line 104

```typescript
// ❌ NGUY HIỂM: KEYS scan toàn bộ keyspace, block Redis thread
async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
}

// ❌ Gọi KEYS trong deletePattern (cache evict)
private async deletePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern); // BLOCKING!
    await Promise.all(keys.map(k => this.redis.del(k)));
}
```

**Vấn đề:** `KEYS` là O(N) và **block Redis event loop** trong khi thực thi. Với database cache lớn (hàng nghìn key), điều này có thể gây **toàn bộ ứng dụng bị delay**. Redis docs khuyến cáo **không dùng `KEYS` trong production**.

**Giải pháp:** Dùng `SCAN` (đã có sẵn method `scan` nhưng chưa được dùng trong `deletePattern`):

```typescript
// ✅ ĐÚNG: Dùng SCAN thay KEYS
private async deletePattern(pattern: string): Promise<void> {
    const keys = await this.redis.scan(pattern); // Non-blocking iteration
    if (keys.length > 0) {
        await Promise.all(keys.map(k => this.redis.del(k)));
    }
}
```

---

#### C2. N+1 Query trong `checkSystemPermissions` và `syncRolesInGroup`
**File:** `src/modules/core/rbac/services/rbac.service.ts` — line 284–298

```typescript
// ❌ N+1: Mỗi roleId gọi 1 query riêng
for (const roleId of roleIds) {
    const rc = await this.roleContextRepo.findFirst({
        where: {
            role_id: BigInt(roleId),
            context_id: (group as any).context_id,
        }
    });
    if (!rc) throw ...
}
```

**Vấn đề:** Nếu có 10 roles, sẽ tạo 10 query riêng biệt đến DB. Với concurrent requests, dễ gây DB connection pool exhaustion.

**Giải pháp:** Batch query một lần:

```typescript
// ✅ ĐÚNG: Một query cho tất cả roles
const validContexts = await this.roleContextRepo.findMany({
    where: {
        role_id: { in: roleIds.map(id => BigInt(id)) },
        context_id: (group as any).context_id,
    }
});
const validRoleIds = new Set(validContexts.map(rc => Number(rc.role_id)));
for (const roleId of roleIds) {
    if (!validRoleIds.has(roleId)) {
        throw new BadRequestException(`Invalid role for this context: ${roleId}`);
    }
}
```

---

#### C3. `checkSystemPermissions` không dùng RBAC cache
**File:** `src/modules/core/rbac/services/rbac.service.ts` — line 120–183

```typescript
// ❌ Không cache: mỗi request đến system-level endpoint đều query DB nhiều lần
private async checkSystemPermissions(userId, required): Promise<boolean> {
    const systemAdminGroup = await this.groupRepo.findFirstRaw(...); // Query 1
    const userInGroup = await this.userGroupRepo.findUnique(...);    // Query 2
    const assignments = await this.assignmentRepo.findManyRaw(...);   // Query 3
    const links = await this.roleHasPermRepo.findMany(...);           // Query 4
}
```

**Vấn đề:** `userHasPermissionsInGroup` có cache nhưng `checkSystemPermissions` (path khi `groupId === null`) lại **không dùng cache**, gây 4 DB queries mỗi request.

**Giải pháp:** Cache system permissions tương tự như group permissions, dùng `systemGroupId` làm cache key.

---

### 🟠 HIGH

#### H1. `getTree` sử dụng `include` lồng nhau 2 cấp không giới hạn
**File:** `src/modules/ecommerce/product-category/infrastructure/repositories/product-category.repository.impl.ts` — line 96–109

```typescript
// ⚠️ Không giới hạn số lượng children, không select specific fields → over-fetching
return this.prisma.productCategory.findMany({
    include: {
        children: {
            include: {
                children: { ... }  // Recursive include, không select
            }
        }
    }
});
```

**Vấn đề:** Không dùng `select` → kéo toàn bộ columns của mỗi category. Nếu có 100 categories, mỗi cái có 15+ columns → payload cực lớn. Thêm nữa, đây là **2-level hardcode** → không flattening được nếu cần 3 levels.

**Giải pháp:** Thêm `select` để chỉ lấy các fields cần thiết:

```typescript
select: {
    id: true, name: true, slug: true, image: true,
    icon: true, sort_order: true, status: true,
    children: {
        where: { deleted_at: null },
        select: {
            id: true, name: true, slug: true, image: true,
            sort_order: true, status: true,
            children: { where: { deleted_at: null }, select: { id: true, name: true, slug: true } }
        }
    }
}
```

---

#### H2. `Promise.all` bị thiếu trong pattern delete (cache evict)
**File:** `src/common/cache/interceptors/cache.interceptor.ts` — line 35–43

```typescript
// ⚠️ Sequential deletion thay vì parallel
for (const keyTemplate of evictOptions.keys) {
    const cacheKey = this.buildCacheKey(keyTemplate, request, args);
    if (cacheKey.endsWith('*')) {
        await this.deletePattern(cacheKey); // Sequential
    } else {
        await this.redis.del(cacheKey);     // Sequential
    }
}
```

**Giải pháp:** Parallel eviction:

```typescript
await Promise.all(
    evictOptions.keys.map(async (keyTemplate) => {
        const cacheKey = this.buildCacheKey(keyTemplate, request, args);
        return cacheKey.endsWith('*')
            ? this.deletePattern(cacheKey)
            : this.redis.del(cacheKey);
    })
);
```

---

#### H3. `syncRolesInGroup` — sequential insert trong loop
**File:** `src/modules/core/rbac/services/rbac.service.ts` — line 307–312

```typescript
// ❌ Sequential: N roles = N round-trips đến DB
for (const role of roles) {
    await this.assignRoleToUser(userId, Number(role.id), groupId);
}
```

Mỗi `assignRoleToUser` lại gọi thêm `findUnique` + `findById` + `findFirst` + `create` = 4 queries/role.

**Giải pháp:** Dùng `createMany` sau khi validate xong:

```typescript
// Validate xong rồi bulk insert
await this.assignmentRepo.createMany(
    roles.map(role => ({
        user_id: BigInt(userId),
        role_id: BigInt(role.id),
        group_id: BigInt(groupId),
    }))
);
```

---

#### H4. `findVariants` dùng `include` thay `select` trong ProductRepository
**File:** `src/modules/ecommerce/product/infrastructure/repositories/product.repository.impl.ts` — line 146–161

```typescript
// ⚠️ include: { attribute_value: true } kéo toàn bộ attribute_value record
return this.prisma.productVariant.findMany({
    include: {
        attributes: {
            include: { attribute_value: true } // Over-fetching
        }
    }
});
```

**Giải pháp:** Dùng `select` để chỉ lấy fields cần thiết từ `attribute_value`.

---

#### H5. `buildCacheKey` dùng `new RegExp` trong vòng lặp
**File:** `src/common/cache/interceptors/cache.interceptor.ts` — line 119–133

```typescript
// ⚠️ Mỗi iteration tạo 1 RegExp object mới
for (const [paramName, paramValue] of Object.entries(params)) {
    key = key.replace(new RegExp(`\\$\\{${paramName}\\}`, 'g'), String(paramValue));
}
```

**Vấn đề:** `new RegExp()` allocation trong hot path (mọi cached request đều gọi), không được tái sử dụng. Với nhiều params, tạo nhiều RegExp objects không cần thiết.

**Giải pháp:** Dùng `replaceAll` với string literal template hoặc precompile regex.

---

### 🟡 MEDIUM

#### M2. `Ward` model thiếu index composite trên `(province_id, status)`
**File:** `prisma/schema.prisma` — model `Ward`

Hiện có index riêng lẻ `idx_wards_province_id` và `idx_wards_status`, nhưng query phổ biến nhất là `WHERE province_id = ? AND status = 'active'` sẽ hưởng lợi từ **composite index**.

```prisma
@@index([province_id, status], map: "idx_wards_province_status")
```

---

#### M3. `PrismaService` không cấu hình connection pool
**File:** `src/core/database/prisma/prisma.service.ts`

```typescript
// ❌ Không cấu hình connection_limit
const adapter = new PrismaMariaDb(url);
super({ adapter: adapter as any });
```

Prisma mặc định `connection_limit = num_cpus * 2 + 1`. Với server nhiều concurrent requests, nên cấu hình rõ ràng trong `DATABASE_URL`:

```
DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=20&pool_timeout=10"
```

---

#### M4. `LoggingInterceptor` serialize body để tính size không hiệu quả
**File:** `src/common/http/interceptors/logging.interceptor.ts` — line 100

```typescript
bodySize: body ? JSON.stringify(body).length : 0,
```

`JSON.stringify` toàn bộ body chỉ để lấy `length` — lãng phí CPU với body lớn.

**Giải pháp:** Đọc `Content-Length` header hoặc dùng `Buffer.byteLength`:

```typescript
bodySize: request.get('content-length') ? parseInt(request.get('content-length')!) : 0,
```

---

#### M5. `getRoot` endpoint trùng logic với `getTree` nhưng không cache
**File:** `src/modules/ecommerce/product-category/public/controllers/product-category.controller.ts` — line 33–37

```typescript
// ❌ Không có @Cacheable, trùng logic với getTree
@Get('root')
async getRoot(@Query(ValidationPipe) query: any) {
    return this.productCategoryService.getCategories({ ...query, format: 'tree' });
}
```

**Giải pháp:** Thêm `@Cacheable` cho endpoint này.

---

#### M6. `findAll` trong PrismaRepository chạy 2 queries song song nhưng count luôn bị gọi
**File:** `src/common/core/repositories/prisma.repository.ts` — line 118–128

```typescript
const [data, total] = await Promise.all([
    this.delegate.findMany({ ... }),
    this.delegate.count({ where }),  // Always runs, kể cả khi không cần
]);
```

Với các endpoint không cần pagination (ví dụ: `getTree`, dropdown options), query `count` là không cần thiết. Nên thêm option `skipCount` để bỏ qua:

```typescript
const [data, total] = options.skipCount
    ? [await this.delegate.findMany({...}), 0]
    : await Promise.all([this.delegate.findMany({...}), this.delegate.count({where})]);
```

---

### 🔵 LOW / CODE QUALITY

#### L1. `NotificationProcessor` chỉ xử lý 1 job type, thiếu retry config
**File:** `src/modules/core/queue/processors/notification.processor.ts`

Không cấu hình `@Process({ attempts: 3, backoff: 5000 })` → job fail sẽ không được retry.

---

#### L2. `generateRequestId` dùng `Math.random().toString(36).substr(2, 9)` — deprecated
**File:** `src/common/http/interceptors/logging.interceptor.ts` — line 156

`substr` đã deprecated. Nên dùng `substring` hoặc `crypto.randomUUID()`.

---

#### L3. Cache key template với query params không encode giá trị
**File:** `src/common/cache/interceptors/cache.interceptor.ts` — line 125–127

Nếu query param chứa ký tự đặc biệt (`:`, `*`, khoảng trắng…), cache key có thể bị conflict hoặc lỗi với `KEYS` pattern matching.

---

#### L4. `enableShutdownHooks` trong PrismaService sử dụng deprecated API
**File:** `src/core/database/prisma/prisma.service.ts` — line 31–35

`$on('beforeExit', ...)` không còn cần thiết khi đã dùng `OnModuleDestroy` pattern — code này là legacy và không được gọi đến.

---

## 📈 Bảng tóm tắt

| ID | Mức độ | Vấn đề | Impact | Effort |
|----|--------|---------|--------|--------|
| C1 | 🔴 Critical | `KEYS` thay vì `SCAN` trong Redis evict | Cao (block production) | Thấp |
| C2 | 🔴 Critical | N+1 query trong `syncRolesInGroup` | Cao | Thấp |
| C3 | 🔴 Critical | `checkSystemPermissions` không cache | Cao | Trung bình |
| H1 | 🟠 High | `getTree` over-fetch toàn bộ columns | Trung bình | Thấp |
| H2 | 🟠 High | Sequential cache eviction thay vì parallel | Trung bình | Rất thấp |
| H3 | 🟠 High | Sequential role insert trong loop | Trung bình | Thấp |
| H4 | 🟠 High | `findVariants` dùng `include` thay `select` | Trung bình | Thấp |
| H5 | 🟠 High | `new RegExp` trong hot path | Thấp-Trung | Trung bình |
| M1 | 🟡 Medium | `deepConvertBigInt` không giới hạn depth | Thấp | Trung bình |
| M2 | 🟡 Medium | `Ward` thiếu composite index | Thấp-Trung | Rất thấp |
| M3 | 🟡 Medium | Thiếu connection pool config | Trung bình | Rất thấp |
| M4 | 🟡 Medium | `JSON.stringify` để tính `bodySize` | Thấp | Rất thấp |
| M5 | 🟡 Medium | `getRoot` endpoint không có cache | Thấp | Rất thấp |
| M6 | 🟡 Medium | `count` query chạy kể cả khi không cần | Thấp | Thấp |
| L1 | 🔵 Low | Queue thiếu retry config | Thấp | Rất thấp |
| L2 | 🔵 Low | `substr` deprecated | Rất thấp | Rất thấp |
| L3 | 🔵 Low | Cache key không encode special chars | Thấp | Thấp |
| L4 | 🔵 Low | Deprecated Prisma `$on('beforeExit')` | Rất thấp | Rất thấp |

---

## 🗺️ Lộ trình ưu tiên cải thiện (Roadmap)

### Sprint 1 — Quick Wins (1–2 ngày)
1. **[C1]** Thay `KEYS` → `SCAN` trong `deletePattern` của `CacheInterceptor`
2. **[H2]** Parallel cache eviction bằng `Promise.all`
3. **[M2]** Thêm composite index `(province_id, status)` cho `Ward`
4. **[M3]** Thêm `connection_limit` vào `DATABASE_URL`
5. **[M4]** Đọc `Content-Length` header thay `JSON.stringify`
6. **[M5]** Thêm `@Cacheable` cho `getRoot` endpoint
7. **[L2]** Thay `substr` → `substring`
8. **[L4]** Xóa code legacy `enableShutdownHooks`

### Sprint 2 — DB & Query Optimization (2–3 ngày)
1. **[C2]** Batch query trong `syncRolesInGroup` (thay N+1 loop)
2. **[H1]** Thêm `select` cho `getTree` trong ProductCategory repository
3. **[H3]** Bulk insert roles thay sequential loop
4. **[H4]** Thêm `select` cho `findVariants`
5. **[M6]** Thêm `skipCount` option vào `findAll` của PrismaRepository
6. **[L1]** Cấu hình retry cho Bull `@Process`

### Sprint 3 — Cache & Architecture (3–5 ngày)
1. **[C3]** Cache system permissions trong `checkSystemPermissions`
2. **[H5]** Precompile regex hoặc dùng string replace trong `buildCacheKey`
3. **[M1]** Thêm `maxDepth` cho `deepConvertBigInt`
4. **[L3]** Encode special characters trong cache key builder

---

## 🔬 Khuyến nghị bổ sung (ngoài code)

| Hạng mục | Khuyến nghị |
|----------|-------------|
| **Monitoring** | Tích hợp **Prometheus + Grafana** để theo dõi response time, DB query time, Redis hit rate |
| **Database** | Bật **slow query log** (> 100ms) trên MariaDB để phát hiện query chậm sớm |
| **Redis** | Cấu hình `maxmemory-policy allkeys-lru` để tự dọn cache khi đầy memory |
| **Load Testing** | Chạy `k6` hoặc `artillery` để có baseline benchmark thực tế trước khi tối ưu |
| **Connection Pooling** | Cân nhắc dùng **PgBouncer/ProxySQL** nếu số concurrent requests tăng cao |
| **API Response** | Bật `compression` middleware (đã có `npm i compression`) cho response > 1KB |
| **Prisma** | Bật `previewFeatures = ["tracing"]` để trace slow queries trong Prisma |

---

*Report generated by automated code audit — 2026-02-23*
