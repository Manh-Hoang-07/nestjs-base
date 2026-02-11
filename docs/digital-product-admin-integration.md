# Digital Product Digital Asset Integration - Admin API

This document describes the Admin API for managing digital assets (accounts, license keys, etc.) in the e-commerce system.

## 1. Overview
Digital assets are stored in the `product_digital_assets` table. Each asset is linked to a `product` or `product_variant`. Assets are encrypted before being stored in the database.

## 2. API Endpoints

### 2.1 Bulk Import Digital Assets
Import multiple assets for a specific product or variant. Each asset content will be automatically encrypted.

- **URL**: `POST /admin/ecommerce/product-digital-assets/bulk-import`
- **Auth**: Required (`JwtAuthGuard`, `RbacGuard`)
- **Permission**: `ecommerce:product:update`
- **Body**:
```json
{
  "product_id": 1,
  "product_variant_id": 10, // Optional
  "contents": [
    "account1|pass1",
    "account2|pass2",
    "license-key-abc-123"
  ]
}
```

### 2.2 Delete Digital Asset
Remove a specific asset by ID. Useful if an asset is invalid or manually assigned.

- **URL**: `DELETE /admin/ecommerce/product-digital-assets/:id`
- **Auth**: Required
- **Permission**: `ecommerce:product:delete`
- **Params**:
    - `id`: BigInt ID of the digital asset.

## 3. Implementation Details

- **Encryption**: Uses `AES-256-CBC` via `EncryptionService`.
- **Status tracking**:
    - `available`: Asset is ready for sale.
    - `sold`: Asset has been assigned to an order.
- **Assignment**: Assets are automatically assigned to order items in `OrderAutomationService` when an order status changes to `paid` or `confirmed` (depending on flow).

## 4. Frontend Integration Tips (Admin)
- Provide a textarea for admins to paste lists of accounts/keys (one per line).
- Split the textarea content by newline to generate the `contents` array for the Bulk Import API.
- Use the `product_id` and `product_variant_id` from the product management pages.
