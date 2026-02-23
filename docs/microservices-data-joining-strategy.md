## Chiến lược join dữ liệu trong kiến trúc microservice (định hướng cho NestJS)

Khi chuyển từ **monolith** (1 DB, join bằng SQL/ORM) sang **microservice** (mỗi service tự quản DB), bạn **không còn join trực tiếp bằng SQL giữa các service** nữa. Thay vào đó, bạn cần chọn chiến lược join ở **tầng service/API** hoặc **tầng dữ liệu read-model**.

Tài liệu này gợi ý **cách tư duy + pattern cụ thể + ví dụ NestJS** để bạn áp dụng dần trên hệ thống hiện tại.

---

## 1. Vấn đề: vì sao “join” trong microservice phức tạp hơn?

- **Monolith (hiện tại)**:
  - DB chung (VD: PostgreSQL với Prisma).
  - Join đơn giản: `JOIN`, `include` trong Prisma (products + order_items + users...).
  - Transaction xuyên các bảng dễ làm (trong cùng DB).

- **Microservice**:
  - Mỗi service sở hữu 1 DB riêng (Order DB, Product DB, User DB...).
  - **Không join trực tiếp** vì:
    - Khác DB, khác schema, có thể khác công nghệ (Postgres, Mongo, Elastic...).
    - Mỗi service tự chịu trách nhiệm về dữ liệu của nó (bounded context).
  - Transaction phân tán khó hơn, thường phải dùng **Saga / outbox / eventual consistency**.

**Kết luận**: Join dữ liệu trong microservice thường là:

- Join ở **tầng API** (API Composition).
- Hoặc **dịch chuyển join sang một read-model đã được “pre-join”** (CQRS / denormalized view).

---

## 2. 3 chiến lược chính để join dữ liệu

### 2.1. API Composition (sync, dễ bắt đầu)

- **Ý tưởng**:
  - Một `BFF` hoặc `Gateway`/`API-composer` gọi **nhiều service con** rồi merge dữ liệu lại trả về cho client.
  - Mỗi service vẫn giữ DB riêng, không cần chia sẻ schema.

- **Khi nên dùng**:
  - Join **ít service** (2–3 service).
  - Không cần performance quá khủng, chấp nhận gọi thêm vài HTTP/gRPC.
  - Muốn dễ debug, dễ triển khai ban đầu.

- **Ví dụ**: API `GET /orders/:id/detail` cần:
  - Order từ **Order Service**.
  - Danh sách sản phẩm từ **Product Service**.
  - Thông tin user từ **User Service**.

### 2.2. Denormalized Read Model (CQRS / View Service)

- **Ý tưởng**:
  - Tạo một **service ReadModel** (hoặc `Reporting/Analytics/Query` service) có DB riêng chứa dữ liệu **đã được “pre-join”**.
  - Các service khác (Order/Product/User) phát **event** (OrderCreated, ProductUpdated...) qua message broker (Redis, RabbitMQ, Kafka...).
  - ReadModel service **subscribe** các event này, update DB của mình theo dạng **denormalized** (đã gộp sẵn).

- **Khi nên dùng**:
  - Join phức tạp, chạm nhiều service, query nặng (dashboard, analytics, báo cáo).
  - Yêu cầu performance đọc cao, chấp nhận **eventual consistency** (trễ vài giây).

### 2.3. Data Duplication có kiểm soát

- **Ý tưởng**:
  - Một service có thể lưu **một phần dữ liệu từ service khác** (chỉ các field cần dùng), được đồng bộ qua event.
  - Ví dụ: `Order Service` lưu luôn `productName`, `productThumbnail` tại thời điểm đặt hàng (từ `Product Service`).

- **Khi nên dùng**:
  - Muốn order history không bị thay đổi khi product đổi tên/giá.
  - Query đơn giản, không cần gọi sang Product mỗi lần xem order history.

---

## 3. Cách tôi sẽ làm nếu refactor hệ thống hiện tại sang microservice

Giả sử bạn tách thành các service:

- `auth-service` / `user-service`
- `product-service`
- `order-service` (cart/checkout/order)
- (sau này) `notification-service`, `reporting-service`, ...

### 3.1. Nguyên tắc dữ liệu chung

- Mỗi service:
  - Sở hữu **DB riêng** (schema riêng).
  - Có **ID** dùng chung để reference (VD: `userId`, `productId` là UUID).

- **Join “lỏng” qua ID**, không join SQL chéo DB:
  - `order-service` chỉ lưu `userId`, `productId`, `priceAtPurchase`, `productNameSnapshot`, ...
  - Lúc cần enrich thêm dữ liệu live (avatar user, stock hiện tại...), mới gọi qua service khác.

### 3.2. Bước đi nhỏ: tạo 1 “API Composer” trong monorepo NestJS

- Trước khi tách hẳn ra nhiều repo, bạn có thể:
  - Tạo module `MicroservicesGatewayModule` hoặc `BffModule` trong app hiện tại.
  - Module này expose các endpoint mới theo kiểu microservice, nhưng bên trong vẫn gọi tới **service nội bộ** (sau này thay bằng HTTP/gRPC call).
  - Sau khi ổn, bạn **tách dần** từng service ra process/host riêng.

---

## 4. Ví dụ cụ thể: Join Order + Product (API Composition)

Giả sử bạn đã tách thành:

- `order-service` (NestJS app riêng, cổng 4001).
- `product-service` (NestJS app riêng, cổng 4002).
- `api-gateway` (NestJS app riêng, cổng 4000).

### 4.1. Contract đơn giản giữa các service

**Order Service** trả về:

```ts
// order-service/src/orders/dto/order-detail.dto.ts
export class OrderDetailDto {
  id: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  status: string;
  createdAt: Date;
}
```

**Product Service** expose endpoint:

```ts
// product-service/src/products/dto/product-basic.dto.ts
export class ProductBasicDto {
  id: string;
  name: string;
  thumbnailUrl: string;
  currentPrice: number;
}
```

Endpoint: `GET /internal/products/basic?ids=...` trả về mảng `ProductBasicDto`.

### 4.2. API Gateway join dữ liệu

**Ý tưởng**:

- API client gọi: `GET /api/orders/:id/detail`.
- Gateway:
  1. Gọi `order-service` lấy `OrderDetailDto`.
  2. Lấy ra list `productId` từ `items`.
  3. Gọi `product-service` lấy thông tin các product tương ứng.
  4. Map/merge thành response cuối cùng cho FE.

**Ví dụ code Gateway (NestJS)**:

```ts
// api-gateway/src/orders/orders.controller.ts
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService, // gọi order-service
    private readonly productsClient: ProductsClient, // gọi product-service
  ) {}

  @Get(':id/detail')
  async getOrderDetail(@Param('id') id: string) {
    const order = await this.ordersService.getOrderById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const productIds = [...new Set(order.items.map((i) => i.productId))];
    const products = await this.productsClient.getProductsBasic(productIds);

    const productMap = new Map(products.map((p) => [p.id, p]));

    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => {
        const product = productMap.get(item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          // dữ liệu enrich từ product-service
          productName: product?.name ?? 'Unknown product',
          productThumbnail: product?.thumbnailUrl ?? null,
          currentPrice: product?.currentPrice ?? null,
        };
      }),
    };
  }
}
```

**ProductsClient** ví dụ gọi HTTP:

```ts
// api-gateway/src/products/products.client.ts
@Injectable()
export class ProductsClient {
  constructor(private readonly httpService: HttpService) {}

  async getProductsBasic(ids: string[]): Promise<ProductBasicDto[]> {
    if (ids.length === 0) return [];

    const { data } = await firstValueFrom(
      this.httpService.get<ProductBasicDto[]>(
        'http://product-service:4002/internal/products/basic',
        { params: { ids: ids.join(',') } },
      ),
    );
    return data;
  }
}
```

**Ưu điểm**:

- Dễ hiểu, code rõ ràng.
- Không động chạm nhiều tới DB schema hiện tại (mới chỉ tách logic ra service).

**Nhược điểm**:

- Gọi nhiều service → latency tăng.
- Endpoint phức tạp join nhiều service → code gateway có thể “phình to”, cần tách layer cẩn thận.

---

## 5. Ví dụ cụ thể: Denormalized Read Model cho báo cáo doanh thu

Giả sử bạn cần **báo cáo doanh thu theo product/category/ngày**, trong khi:

- `order-service` giữ order + order_items.
- `product-service` giữ product + category.

Nếu truy vấn trực tiếp bằng API composition sẽ:

- Gọi nhiều lần.
- Khó group/aggregate (sum revenue theo ngày, theo category).

### 5.1. Thiết kế ReadModel Service

- Tạo service mới: `reporting-service` với DB của riêng nó, ví dụ bảng:

```sql
CREATE TABLE order_revenue_daily (
  id UUID PRIMARY KEY,
  orderId UUID,
  productId UUID,
  categoryId UUID,
  orderDate DATE,
  quantity INT,
  unitPrice NUMERIC,
  total NUMERIC,
  productNameSnapshot TEXT,
  categoryNameSnapshot TEXT
);
```

- `order-service` & `product-service` phát event:
  - `OrderCreated` (gồm item, priceAtPurchase, userId...).
  - `ProductCategoryChanged`, `ProductNameUpdated` (nếu bạn muốn update snapshot).

- `reporting-service` subscribe event, update bảng `order_revenue_daily`.

### 5.2. Sử dụng NestJS + message broker (ví dụ Redis / NATS / RabbitMQ)

Pseudo-code cho `OrderCreated` event:

```ts
// order-service/src/orders/orders.service.ts
@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus, // abstraction gửi message
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = await this.prisma.$transaction(async (tx) => {
      // ... logic tạo order + order_items ...
      return createdOrder;
    });

    // Emit event sau khi transaction thành công
    await this.eventBus.publish('order.created', {
      orderId: order.id,
      userId: order.userId,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    });

    return order;
  }
}
```

`reporting-service` subscribe:

```ts
// reporting-service/src/order-revenue/order-revenue.subscriber.ts
@Injectable()
export class OrderRevenueSubscriber {
  constructor(
    private readonly repo: OrderRevenueRepository,
    private readonly productsClient: ProductsClient,
  ) {}

  @OnEvent('order.created') // hoặc @MessagePattern nếu dùng microservices transport
  async handleOrderCreated(event: OrderCreatedEvent) {
    const productIds = [...new Set(event.items.map((i) => i.productId))];
    const products = await this.productsClient.getProductsBasic(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of event.items) {
      const product = productMap.get(item.productId);
      await this.repo.insert({
        orderId: event.orderId,
        productId: item.productId,
        categoryId: product?.categoryId ?? null,
        orderDate: event.createdAt,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.unitPrice * item.quantity,
        productNameSnapshot: product?.name ?? null,
        categoryNameSnapshot: product?.categoryName ?? null,
      });
    }
  }
}
```

Lúc này, API báo cáo trong `reporting-service` chỉ cần query 1 bảng:

```ts
// reporting-service/src/order-revenue/order-revenue.controller.ts
@Controller('reports/revenue')
export class OrderRevenueController {
  constructor(private readonly repo: OrderRevenueRepository) {}

  @Get('by-day')
  async getRevenueByDay(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    // SELECT orderDate, SUM(total) FROM order_revenue_daily ...
    return this.repo.getRevenueByDay(new Date(from), new Date(to));
  }
}
```

**Ưu điểm**:

- Query nhanh, đơn giản.
- Không phải gọi chéo nhiều service trong lúc FE request.

**Nhược điểm**:

- Dữ liệu **eventual consistent** (có độ trễ).
- Cần thêm công sức cho hạ tầng message/event.

---

## 6. Khi nào chọn cách nào?

- **Đọc “real-time”, ít service, logic đơn giản** → **API Composition**.
  - Ví dụ: Order detail + product detail + user basic info.

- **Báo cáo, analytics, dashboard nặng** → **Denormalized Read Model (CQRS)**.
  - Ví dụ: Doanh thu, báo cáo theo category, funnel.

- **Dữ liệu lịch sử cần giữ nguyên snapshot** → **Data Duplication**.
  - Ví dụ: Order lưu `productName` tại thời điểm mua.

Bạn có thể **kết hợp**: order detail sử dụng snapshot + enrich thêm dữ liệu live từ product-service nếu cần.

---

## 7. Lộ trình gợi ý cho dự án hiện tại

- **Phase 1 – Chuẩn hóa ID & hợp đồng giữa các module**
  - Đảm bảo mọi entity quan trọng (`User`, `Product`, `Order`, `Post`...) có `id` global (UUID).
  - Trong DB hiện tại, giảm lệ thuộc vào foreign key cross-module cứng; sử dụng reference thông qua ID.

- **Phase 2 – Tạo lớp “API Composer” bên trong monolith**
  - Tạo các controller/service chuyên trả data đã join sẵn cho FE theo style microservice.
  - Bên trong vẫn dùng Prisma join, nhưng **interface** đã giống như việc gọi nhiều service.

- **Phase 3 – Tách service đầu tiên (ví dụ: Product Service)**
  - Di chuyển logic/product repository sang app riêng.
  - API Composer chuyển từ gọi nội bộ → gọi HTTP/gRPC tới Product Service.

- **Phase 4 – Thêm Reporting/ReadModel Service cho các màn nặng**
  - Dùng event + denormalized DB cho báo cáo.
  - Dần dần chuyển các màn admin analytics sang dùng Reporting Service.

- **Phase 5 – Tối ưu, chuẩn hóa**
  - Bổ sung gateway/BFF chính thức.
  - Bổ sung circuit breaker, retry, cache cho API composition.

---

Nếu bạn muốn, mình có thể tiếp tục viết thêm một file mô tả chi tiết **cách tách riêng `product-service` từ code hiện tại (NestJS + Prisma)`**, gồm: cấu trúc folder, DTO, mapping từ monolith sang microservice, và sample config cho NestJS microservices transport (Redis/NATS/RMQ).


