import { Global, Module } from '@nestjs/common';
import { CONTACT_REPOSITORY } from './domain/contact.repository';
import { ContactRepositoryImpl } from './infrastructure/repositories/contact.repository.impl';

@Global()
@Global()
@Module({
    providers: [
        {
            provide: CONTACT_REPOSITORY,
            useClass: ContactRepositoryImpl,
        },
    ],
    exports: [CONTACT_REPOSITORY],
})
export class ContactRepositoryModule { }
