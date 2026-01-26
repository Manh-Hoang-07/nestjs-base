import { PartialType } from '@nestjs/mapped-types';
import { CreatePostTagDto } from '@/modules/post/post-tag/admin/dtos/create-post-tag.dto';

export class UpdatePostTagDto extends PartialType(CreatePostTagDto) { }

