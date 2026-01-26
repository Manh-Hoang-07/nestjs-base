import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ContactService } from '@/modules/introduction/contact/admin/services/contact.service';
import { CreateContactDto } from '@/modules/introduction/contact/admin/dtos/create-contact.dto';
import { UpdateContactDto } from '@/modules/introduction/contact/admin/dtos/update-contact.dto';
import { prepareQuery } from '@/common/core/utils';
import { LogRequest } from '@/common/shared/decorators';
import { Permission } from '@/common/auth/decorators';
import { AuthService } from '@/common/auth/services';

@Controller('admin/contacts')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly auth: AuthService,
  ) { }

  @Permission('contact.manage')
  @LogRequest()
  @Post()
  create(@Body(ValidationPipe) createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @Permission('contact.manage')
  @Get()
  findAll(@Query(ValidationPipe) query: any) {
    return this.contactService.getList(query);
  }

  @Permission('contact.manage')
  @Get('simple')
  getSimpleList(@Query(ValidationPipe) query: any) {
    return this.contactService.getSimpleList(query);
  }

  @Permission('contact.manage')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactService.getOne(+id);
  }

  @Permission('contact.manage')
  @LogRequest()
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateContactDto: UpdateContactDto,
  ) {
    return this.contactService.update(+id, updateContactDto);
  }

  @Permission('contact.manage')
  @LogRequest()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactService.delete(+id);
  }

  @Permission('contact.manage')
  @LogRequest()
  @Put(':id/reply')
  reply(
    @Param('id') id: string,
    @Body('reply') reply: string,
  ) {
    return this.contactService.replyToContact(+id, reply, this.auth.id() || undefined);
  }

  @Permission('contact.manage')
  @LogRequest()
  @Put(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(+id);
  }

  @Permission('contact.manage')
  @LogRequest()
  @Put(':id/close')
  close(@Param('id') id: string) {
    return this.contactService.closeContact(+id);
  }
}

