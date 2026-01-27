## Đánh giá tổng quan module Ecommerce

- **Kiến trúc tổng thể**
  - Module `ecommerce` được tách khá rõ theo từng bounded context: `product`, `product-variant`, `product-category`, `cart`, `order`, `coupon`, `shipping`, `warehouse`, v.v… Mỗi context lại chia tiếp `domain` (interface repository), `infrastructure` (Prisma impl), `public` / `user` / `admin` (controller + dto + service). Đây là hướng rất tốt cho **mở rộng về sau** và dễ tách microservice nếu cần.
  - Các service chính (`PublicCartService`, `PublicOrderService`, `PublicProductService`, …) hầu hết chỉ làm orchestration, còn logic chi tiết tách ra thành các service con (`CartValidationService`, `CartCalculationService`, `CartManagementService`, `OrderCreationService`, `OrderValidationService`, …). Cách chia nhỏ này giúp luồng xử lý **dễ đọc** và **dễ test đơn vị**.
  - Layer repository dùng `PrismaRepository` base, có `defaultSelect`, `buildWhere`, v.v. giúp chuẩn hóa cách truy vấn. Đây là nền tốt nếu sau này đổi ORM / data source.

- **Luồng nghiệp vụ chính**
  - **Cart (public)**:
    - `GET /public/cart` và `GET /public/cart/summary` gọi `PublicCartService.getCartSummary(sessionId?, cartUuid?, userId?)` → `CartManagementService.getOrCreateCart` → `CartManagementService.getCartSummary`. Luồng này tương đối rõ: luôn đảm bảo có cart header, sau đó trả về summary với items + product/variant.
    - `POST /public/cart/add` → `PublicCartService.addToCart`:
      1. Lấy/khởi tạo cart (`getOrCreateCart`).
      2. Validate + "lock" `ProductVariant`.
      3. Tìm item tồn tại.
      4. Validate tồn kho theo tổng số lượng.
      5. Tạo/ cập nhật item.
      6. Cập nhật lại tổng tiền.
      7. Trả lại cart summary.
      → Luồng này **đúng hướng, dùng transaction Prisma**, đảm bảo an toàn tương đối về mặt dữ liệu.
    - `PUT /public/cart/update` / `PUT /public/cart/items/:id` / `DELETE /public/cart/item/:id` / `DELETE /public/cart/clear` đều đi qua các hàm `updateCartItem`, `removeFromCart`, `clearCart` trong `PublicCartService`, có transaction + validate ownership qua `CartValidationService`. Về cơ bản là **đã nghĩ tới bảo mật** (chỉ owner mới sửa được).
  - **Order (public)**:
    - `PublicOrderService.createOrderFromCart`:
      1. Từ `CreateOrderDto` lấy thông tin khách + `cart_uuid`.
      2. Transaction Prisma:
         - Validate + lấy cart (`OrderValidationService.validateAndGetCart`).
         - Validate items không rỗng + validate variants + tồn kho.
         - Tính `orderType` (physical/digital/mixed) từ `OrderCalculationService`.
         - Validate payment method/ shipping phù hợp.
         - Tạo `Order` (qua `OrderCreationService.createOrder`), rồi `OrderItem`, trừ stock, tạo payment offline, clear cart.
      3. Tạo `access_url` với `hashKey` để khách truy cập order.
      → Luồng nghiệp vụ order **rõ ràng, giữ được tính toàn vẹn** và tương đối dễ mở rộng (thêm case digital/mixed, shipping provider bên ngoài, …).

## Đánh giá kỹ hơn về Cart UUID & luồng nhận diện cart

- **Thiết kế hiện tại**
  - DB:
    - `CartHeader.uuid: String? @unique @db.VarChar(36)` là public identifier của cart.
    - `CartHeader.owner_key: String` lưu dạng `user_<id>`, `session_<id>`, `guest_<uuid>`.
  - Ở `CartManagementService.getOrCreateCart`:
    - Ưu tiên tìm cart theo:
      1. `userId` → `cartRepository.findByUserId(userId)` (tức là tìm theo `user_id`).
      2. Nếu chưa có & có `cartUuid` → `cartRepository.findByOwnerKey(cartUuid)`.
      3. Nếu chưa có & có `sessionId` → `cartRepository.findByOwnerKey('session_'+sessionId)`.
    - Nếu vẫn không có:
      - Tạo `owner_key`:
        - `user_<userId>` nếu đăng nhập,
        - `session_<sessionId>` nếu có session,
        - `guest_<uuidv4()>` nếu không có gì.
      - `uuid` của cart:
        - `finalCartUuid = cartUuid || uuidv4()`.
  - `ICartRepository` + `CartRepositoryImpl`:
    - `findByOwnerKey(ownerKey: string)` build where `owner_key = ownerKey`.
    - **Không có** method tìm theo `uuid`.
  - DTO:
    - `AddToCartDto.cart_uuid` có `@IsUUID()`, nên FE buộc phải truyền UUID chuẩn v4.
    - `CreateOrderDto.cart_uuid` chỉ `@IsString()`, không enforce UUID.
  - `OrderValidationService.validateAndGetCart`:
    - Nếu có `userId`: tìm theo `owner_key = 'user_<id>'`.
    - Nếu **không** có `userId` nhưng có `cartUuid`: tìm theo `uuid = cartUuid`.

- **Vấn đề & rủi ro**
  - **Bug logic khi tìm cart theo `cart_uuid` trong Cart module**:
    - `CartManagementService.getOrCreateCart` đang dùng:
      - `cartHeader = await this.cartRepository.findByOwnerKey(cartUuid);`
    - Nhưng `findByOwnerKey` filter theo `owner_key`, không phải `uuid`. Trong khi khi tạo cart:
      - `owner_key` là `user_...` / `session_...` / `guest_<uuid v4 khác>`.
      - `uuid` mới là trường public để FE lưu.
    - Kết quả:
      - Gửi `cart_uuid` từ FE vào backend **sẽ không tìm được cart** (trừ khi vô tình `owner_key` trùng string đó, gần như không xảy ra).
      - Backend sẽ tạo **cart mới** với `uuid` mới, khiến FE thấy cart "reset", mất items cũ.
      - Trong khi bên Order (`OrderValidationService`) thì lại tìm đúng theo cột `uuid`. Hai phía không thống nhất → dễ gây bug khó debug.
  - **Không enforce UUID cho `CreateOrderDto.cart_uuid`**:
    - Có thể nhận chuỗi bất kỳ. Với guest cart luồng order, `validateAndGetCart` sẽ query `where: { uuid: cartUuid }`. Nếu FE truyền linh tinh dễ fail NotFound, hoặc future tấn công brute-force (dù UUID khó đoán).
  - **Trộn khái niệm giữa `owner_key` và `uuid`**:
    - Ở Cart: `cartUuid` đang bị dùng như thể là `owner_key` (do repo chỉ cho filter ownerKey).
    - Ở Order: `cartUuid` đúng là `uuid`.
    - Điều này làm flow khó hiểu hơn cho dev mới vào project.

- **Định hướng cải thiện Cart UUID**
  - **Tách rõ 2 khái niệm**:
    - `uuid`: public identifier cho FE, dùng trong mọi API giữa FE ↔ BE khi nói về "cart của người dùng" mà không cần auth.
    - `owner_key`: internal field cho backend, dùng để gắn cart với user/session/guest token, **không expose ra ngoài**.
  - **Sửa logic tìm cart trong `CartManagementService`**:
    - Thay vì `findByOwnerKey(cartUuid)` khi có `cartUuid`, nên:
      - Hoặc thêm method repo `findByUuid(uuid: string)` dùng `where: { uuid }`.
      - Hoặc dùng trực tiếp Prisma:
        - `this.prisma.cartHeader.findUnique({ where: { uuid: cartUuid } })`.
    - Luồng đề xuất:
      1. Nếu có `userId` → tìm cart của user (chỉ 1 cart active / user).
      2. Nếu không có `userId` nhưng có `cartUuid` → tìm cart theo `uuid`.
      3. Nếu không có gì nhưng có `sessionId` → tìm theo `owner_key = 'session_'+sessionId`.
      4. Nếu vẫn không có → tạo mới (set `uuid` mới, `owner_key` phù hợp).
  - **Thống nhất validate DTO**:
    - `CreateOrderDto.cart_uuid` cũng nên dùng `@IsUUID()` giống `AddToCartDto.cart_uuid` cho đồng nhất và đảm bảo data hợp lệ.
  - **Bổ sung docs luồng cart**:
    - Viết tài liệu ngắn mô tả:
      - FE lưu `cart_uuid` ở localStorage/cookie.
      - Khi user login, BE có thể merge cart guest vào cart user (nếu cần, hiện chưa thấy logic merge).
      - Owner kiểm tra: nếu có `userId` thì `owner_key` phải là `user_<userId>`, nếu không chỉ chấp nhận guest cart qua `uuid`.

## Mức độ tối ưu & khả năng mở rộng

- **Điểm mạnh**
  - **Transaction & tính toàn vẹn dữ liệu**:
    - Những thao tác quan trọng (add/update/remove cart item, clear cart, create order, cancel order) đều bọc trong `prisma.$transaction`, hạn chế trạng thái dở dang.
    - Tách `OrderCreationService.createOrderItemsAndDeductStock` + validate variants/stock trong `OrderValidationService` giúp việc kiểm soát tồn kho khá rõ.
  - **Phân tầng hợp lý**:
    - Controller rất mỏng, mainly gọi service + DTO + decorator auth/log → dễ hiểu luồng HTTP.
    - Service domain (`PublicOrderService`, `PublicCartService`) chủ yếu điều phối các service con + repo → dễ refactor thành microservice.
  - **Kho dữ liệu & schema**:
    - Schema Prisma được thiết kế tương đối chuẩn cho ecommerce: products, variants, attributes, coupons, cart, order, payment, shipping, warehouse. Ràng buộc unique/foreign key khá rõ, index hợp lý.
    - `CartHeader` + `Cart` + `Order` + `OrderItem` mapping hợp lý, thuận tiện trace từ cart → order → stock.

- **Điểm có thể cải thiện**
  - **Giảm N+1 / tối ưu query**:
    - `CartManagementService.getCartSummary`:
      - Đầu vào đã là `cartHeader` (có thể được load từ repo với `defaultSelect` + `items include variant/product`), nhưng service lại query `prisma.cartHeader.findUnique(... include items...)` thêm lần nữa. Có thể làm:
        - Hoặc để repo trả về đầy đủ data (items + variants + products) rồi format lại.
        - Hoặc repo chỉ trả `id` và `uuid`, và `getCartSummary` luôn là nơi duy nhất load full cart. Tránh double query.
  - **Ràng buộc type & DTO chặt hơn**:
    - `CreateOrderDto.shipping_address` / `billing_address` đang là `any`. Nên define class DTO riêng (ví dụ `AddressDto` có `name`, `phone`, `province`, `district`, `ward`, `address_line`, v.v.) rồi dùng lồng trong DTO để:
      - Validate dữ liệu đầu vào tốt hơn.
      - FE/BE cùng đọc docs/ts type dễ hiểu.
  - **Config hoá một số logic cứng**:
    - Trong `OrderCreationService.createPaymentRecord`, code các phương thức `'cod'`, `'bank_transfer'` đang hard-code. Có thể:
      - Đưa list này vào config (`config/payment.ts`) hoặc enum, để sau này thêm phương thức offline mới không phải sửa logic core.
    - Tương tự với danh sách provider online `['vnpay', 'momo']` trong `PublicOrderService.createOrderFromCart`: cũng nên config hóa.
  - **Tách rõ luồng payment online**:
    - Trong `createOrderFromCart`, comment đã note rằng `paymentService.create` nên được gọi ngoài transaction chính. Hiện tại block này chỉ log mà không thực thi.
    - Để dễ mở rộng (VNPay, MoMo, PayOS, Stripe…), nên design:
      - Transaction chỉ tạo order + payment record ở trạng thái `pending`.
      - Sau khi commit, gọi service tạo URL thanh toán.
      - Khi thanh toán thành công (IPN/callback), update `Payment` + `Order.payment_status`.

## Gợi ý hướng phát triển & chuẩn hoá luồng ecommerce

- **1. Chuẩn hoá luồng Cart cho guest + user**
  - Xử lý dứt điểm bug `cart_uuid` như đã nêu (sử dụng cột `uuid` khi lookup).
  - Định nghĩa rõ 3 case:
    - Guest: chỉ có `cart_uuid`.
    - Session: có `sessionId` (nếu bạn dùng).
    - Logged-in user: có `userId` + có thể có `cart_uuid` guest cũ → merge cart.
  - Thêm một use-case:
    - Khi user login, FE gửi `cart_uuid` guest hiện tại, BE:
      - Lấy cart guest theo `uuid`.
      - Lấy cart user hiện tại (nếu có).
      - Merge 2 cart (gộp item, cộng quantity, validate stock, …), sau đó xoá cart guest, update `owner_key` → `user_<id>`.

- **2. Tài liệu hoá flow chính (cart → checkout → order)**
  - Trong thư mục `docs/api/ecommerce` (có thể tạo mới), nên thêm:
    - Sequence diagram hoặc bullet mô tả:
      - Add to cart (guest/user).
      - Lấy cart, cập nhật cart.
      - Checkout tạo order từ cart (bao gồm validate nào, payment, shipping).
      - Cách sử dụng `access_url` để guest tra cứu order.
  - Điều này sẽ giúp dev FE/BE mới nắm bắt cực nhanh và giảm bug do hiểu sai.

- **3. Logging & observability**
  - Đã có decorator `@LogRequest()` cho một số endpoint cart. Có thể:
    - Chuẩn hóa log khi tạo order: log `order_number`, `userId`, `cart_uuid`, `total_amount`, payment method code.
    - Thêm metric cơ bản (tuỳ stack bạn dùng): số order theo status, số lần checkout fail vì stock, v.v.

- **4. Chuẩn bị cho scale & microservices**
  - Với kiến trúc đã chia domain rõ ràng, sau này nếu cần:
    - Có thể tách `order-service`, `product-service`, `inventory-service`, `payment-service` thành riêng, chỉ giữ API gateway ở đây.
    - Để chuẩn bị, nên:
      - Hạn chế logic cross-module trực tiếp (ví dụ: order gọi thẳng payment), thay bằng interface/service abstraction.
      - Gom các event chính (OrderCreated, PaymentCompleted, StockLow, …) vào một lớp/event bus nội bộ; sau này dễ switch sang message broker (Kafka/RabbitMQ).

## Kết luận ngắn

- **Mức độ tối ưu & khả năng mở rộng**: kiến trúc hiện tại đã ở mức **khá tốt**, có phân tầng rõ, transaction hợp lý, schema chuẩn cho ecommerce, rất ổn để scale thêm tính năng.
- **Điểm yếu lớn nhất liên quan tới cart** là **sai khác giữa cách dùng `owner_key` và `uuid`**, dẫn tới bug khi dùng `cart_uuid` cho Cart module. Cần sửa sớm để tránh mất dữ liệu giỏ hàng của user.
- Sau khi fix luồng `cart_uuid` và chuẩn hoá DTO/flow như gợi ý, module ecommerce của bạn sẽ khá "production-ready" và sẵn sàng mở rộng cho loyalty, promotion engine, multi-warehouse, multi-currency, v.v.


