import { PartialType } from '@nestjs/mapped-types';
import { CreateProductVariantDto } from '@/modules/ecommerce/admin/product-variant/dtos/create-product-variant.dto';

export class UpdateProductVariantDto extends PartialType(CreateProductVariantDto) { }