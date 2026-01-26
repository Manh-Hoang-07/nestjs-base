import { Global, Module } from '@nestjs/common';
import { MENU_REPOSITORY } from './domain/menu.repository';
import { MenuRepositoryImpl } from './infrastructure/repositories/menu.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: MENU_REPOSITORY,
            useClass: MenuRepositoryImpl,
        },
    ],
    exports: [MENU_REPOSITORY],
})
export class MenuRepositoryModule { }
