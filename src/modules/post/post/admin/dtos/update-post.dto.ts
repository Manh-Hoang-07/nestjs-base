import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from '@/modules/post/post/admin/dtos/create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) { }

