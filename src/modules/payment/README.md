# Payment Module - Cấu trúc

## Cấu trúc thư mục

```
payment/
├── payment.module.ts                    # Module chính
├── public/                              # Public API (cho user)
│   ├── payment.module.ts
│   ├── controllers/
│   │   └── payment.controller.ts        # API endpoints
│   ├── dtos/
│   │   ├── create-payment-url.dto.ts
│   │   ├── create-payment.dto.ts
│   │   └── get-payments.dto.ts
│   └── services/
│       └── payment.service.ts           # Business logic
└── shared/                              # Shared utilities
    ├── payment-gateway.service.ts       # Gateway manager
    ├── gateways/
    │   ├── vnpay.gateway.ts             # VNPay integration
    │   └── cod.gateway.ts               # COD integration
    └── interfaces/
        └── payment-gateway.interface.ts # Gateway contract
```

## Tính năng

- ✅ VNPay payment gateway
- ✅ COD (Cash on Delivery)
- ✅ Payment verification
- ✅ Webhook handling
- ✅ Payment list & detail

## Lưu ý

⚠️ Module cần **Order model** để hoạt động đầy đủ.  
Hiện tại `PaymentService.create()` sẽ throw error.

## API Endpoints

- `POST /payment/create-url` - Tạo URL thanh toán
- `POST /payment/create` - Tạo payment offline
- `GET /payment/vnpay/return` - VNPay callback
- `POST /payment/vnpay/ipn` - VNPay webhook
- `GET /payment` - Danh sách payments
- `GET /payment/:id` - Chi tiết payment
