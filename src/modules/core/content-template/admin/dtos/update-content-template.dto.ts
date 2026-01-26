import { PartialType } from '@nestjs/mapped-types';
import { CreateContentTemplateDto } from './create-content-template.dto';

export class UpdateContentTemplateDto extends PartialType(CreateContentTemplateDto) { }
