# BaseService - Auto Add Group ID

## Tổng quan

`BaseService` đã được cập nhật để hỗ trợ tự động thêm `group_id` vào payload khi tạo mới entity, giúp giảm thiểu code lặp lại trong các service con.

## Cách sử dụng

### 1. Bật tính năng autoAddGroupId

Trong constructor của service con, set `this.autoAddGroupId = true`:

```typescript
@Injectable()
export class ComicService extends BaseService<Comic, IComicRepository> {
  constructor(
    @Inject(COMIC_REPOSITORY)
    protected readonly comicRepository: IComicRepository,
  ) {
    super(comicRepository);
    // Bật tự động thêm group_id khi tạo mới
    this.autoAddGroupId = true;
  }
}
```

### 2. Gọi super.beforeCreate() trong beforeCreate hook

Nếu service của bạn override `beforeCreate`, hãy gọi `super.beforeCreate()` để kích hoạt logic tự động thêm `group_id`:

```typescript
protected override async beforeCreate(data: CreateComicDto): Promise<any> {
  // Gọi base beforeCreate để tự động thêm group_id
  const payload = await super.beforeCreate(data);

  // Xử lý logic riêng của service
  if (!payload.slug) {
    payload.slug = StringUtil.toSlug(payload.title);
  }

  return payload;
}
```

### 3. Không cần gọi super.beforeCreate() nếu không override

Nếu service không override `beforeCreate`, logic tự động thêm `group_id` sẽ được kích hoạt tự động:

```typescript
@Injectable()
export class SimpleService extends BaseService<Entity, IRepository> {
  constructor(
    @Inject(REPOSITORY_TOKEN)
    protected readonly repository: IRepository,
  ) {
    super(repository);
    // Chỉ cần bật flag này
    this.autoAddGroupId = true;
  }
  // Không cần override beforeCreate
}
```

## Cách hoạt động

Khi `autoAddGroupId = true`, `BaseService.beforeCreate()` sẽ:

1. Lấy `groupId` từ `RequestContext`
2. Nếu `groupId` tồn tại, tự động thêm vào payload: `payload.group_id = groupId`
3. Trả về payload đã được xử lý

```typescript
protected async beforeCreate(data: any): Promise<any> {
  const payload = { ...data };

  // Tự động thêm group_id nếu được bật
  if (this.autoAddGroupId) {
    const groupId = RequestContext.get<number | null>('groupId');
    if (groupId) {
      (payload as any).group_id = groupId;
    }
  }

  return payload;
}
```

## Migration từ code cũ

### Trước đây (code lặp lại):

```typescript
protected override async beforeCreate(data: any): Promise<any> {
  const payload = { ...data };
  
  // Logic riêng
  if (!payload.slug) {
    payload.slug = StringUtil.toSlug(payload.name);
  }

  // Code lặp lại ở nhiều service
  const groupId = RequestContext.get<number | null>('groupId');
  if (groupId) {
    (payload as any).group_id = groupId;
  }

  return payload;
}
```

### Sau khi refactor:

```typescript
constructor(...) {
  super(repository);
  this.autoAddGroupId = true; // Thêm dòng này
}

protected override async beforeCreate(data: any): Promise<any> {
  const payload = await super.beforeCreate(data); // Gọi super
  
  // Chỉ giữ lại logic riêng
  if (!payload.slug) {
    payload.slug = StringUtil.toSlug(payload.name);
  }

  return payload;
}
```

## Lưu ý

- **Mặc định**: `autoAddGroupId = false`, tính năng không được bật tự động
- **Tương thích ngược**: Các service cũ không bật flag này sẽ hoạt động bình thường
- **RequestContext**: Đảm bảo `RequestContext` đã được set `groupId` qua middleware/interceptor
- **Override beforeCreate**: Luôn nhớ gọi `await super.beforeCreate(data)` nếu bạn override method này

## Các service đã áp dụng

- ✅ `ComicService`
- ✅ `ComicCategoryService`
- ✅ `ChapterService`

## TODO

Các service sau vẫn đang sử dụng cách cũ và cần được refactor:

- `PostService`
- `ProductService`
- `ProductCategoryService`
- `ProductAttributeService`
- `ProductVariantService`
- `WarehouseService`
- `MenuService`
- `UserService`
- `CouponService`
- `OrderService`
- Và các service khác...

Để refactor, chỉ cần:
1. Thêm `this.autoAddGroupId = true` vào constructor
2. Thay `const payload = { ...data }` bằng `const payload = await super.beforeCreate(data)`
3. Xóa đoạn code thêm `group_id` thủ công
