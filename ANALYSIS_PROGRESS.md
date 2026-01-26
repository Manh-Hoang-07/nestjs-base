# Tiến độ chuyển đổi Module

## Payment Method
- [x] Schema: Added `PaymentType` enum and `PaymentMethod` model.
- [x] Repository: Created `PaymentMethodRepository`.
- [x] Service: Refactored `PaymentMethodService` to use Prisma.
- [x] Controller: Updated Admin and Public controllers.
- [x] Module: Updated `PaymentMethodModule` to remove TypeORM.
- [x] DTOs: Fixed imports.

## Next Steps
- **Payment Module**: `src/modules/payment` -> `Payment` entity.
- **Ecommerce Module**: `src/modules/ecommerce` -> `Product`, `Order`, `Cart`, etc.
