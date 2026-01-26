import { Injectable, Inject } from '@nestjs/common';
import { IContactRepository, CONTACT_REPOSITORY, ContactFilter } from '@/modules/introduction/contact/domain/contact.repository';
import { ContactStatus } from '@/shared/enums/types/contact-status.enum';
import { CreateContactDto } from '@/modules/introduction/contact/public/dtos/create-contact.dto';
import { BaseService } from '@/common/core/services';

@Injectable()
export class PublicContactService extends BaseService<any, IContactRepository> {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepo: IContactRepository,
  ) {
    super(contactRepo);
  }

  /**
   * Tạo contact mới từ public
   */
  async create(createContactDto: CreateContactDto) {
    return super.create({
      name: createContactDto.name,
      email: createContactDto.email,
      phone: createContactDto.phone ?? null,
      subject: createContactDto.subject ?? null,
      message: createContactDto.message,
      status: ContactStatus.Pending as any,
    });
  }
}

