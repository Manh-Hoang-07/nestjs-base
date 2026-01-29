import { PartialType } from '@nestjs/mapped-types';
import { CreateProductVariantDto } from './create-product-variant.dto';

// Update DTO cho phép gửi lại danh sách attributes (sẽ overwrite toàn bộ attributes của variant nếu được gửi)
export class UpdateProductVariantDto extends PartialType(CreateProductVariantDto) { }
