import { Injectable, Inject } from '@nestjs/common';
import { Contact } from '@prisma/client';
import { IContactRepository, CONTACT_REPOSITORY, ContactFilter } from '@/modules/introduction/contact/domain/contact.repository';
import { ContactStatus } from '@/shared/enums/types/contact-status.enum';
import { BaseService } from '@/common/core/services';

@Injectable()
export class ContactService extends BaseService<Contact, IContactRepository> {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepo: IContactRepository,
  ) {
    super(contactRepo);
  }

  async getList(query: any) {
    const filter: ContactFilter = {};
    if (query.search) filter.search = query.search;
    if (query.status) filter.status = query.status;

    return super.getList({
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      filter,
    });
  }

  async getSimpleList(query: any) {
    return this.getList({
      ...query,
      limit: query.limit ?? 50,
    });
  }

  async replyToContact(id: number, reply: string, repliedBy?: number) {
    const data = {
      reply,
      status: ContactStatus.Replied as any,
      replied_at: new Date(),
      replied_by: repliedBy ? BigInt(repliedBy) : null,
    };
    return this.update(id, data);
  }

  async markAsRead(id: number) {
    const contact = await this.getOne(id);
    if (contact && (contact as any).status === ContactStatus.Pending) {
      return this.update(id, { status: ContactStatus.Read as any });
    }
    return contact;
  }

  async closeContact(id: number) {
    return this.update(id, { status: ContactStatus.Closed as any });
  }

  protected transform(contact: any) {
    if (!contact) return contact;
    return super.transform(contact);
  }
}

