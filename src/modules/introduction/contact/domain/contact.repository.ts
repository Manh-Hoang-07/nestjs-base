
import { Contact } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const CONTACT_REPOSITORY = 'IContactRepository';

export interface ContactFilter {
    search?: string;
    status?: string;
}

export interface IContactRepository extends IRepository<Contact> {
}
