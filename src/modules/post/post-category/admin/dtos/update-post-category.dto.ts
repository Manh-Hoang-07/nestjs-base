import { PartialType } from '@nestjs/mapped-types';
import { CreatePostCategoryDto } from '@/modules/post/post-category/admin/dtos/create-post-category.dto';

export class UpdatePostCategoryDto extends PartialType(CreatePostCategoryDto) { }

