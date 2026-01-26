import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { PublicContactService } from '@/modules/introduction/contact/public/services/contact.service';
import { CreateContactDto } from '@/modules/introduction/contact/public/dtos/create-contact.dto';
import { Permission } from '@/common/auth/decorators';
import { LogRequest } from '@/common/shared/decorators';

@Controller('public/contacts')
export class PublicContactController {
  constructor(private readonly contactService: PublicContactService) {}

  @Permission('public')
  @LogRequest()
  @Post()
  create(@Body(ValidationPipe) createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }
}

