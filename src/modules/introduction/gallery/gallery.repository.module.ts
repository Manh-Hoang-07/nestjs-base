import { Global, Module } from '@nestjs/common';
import { GALLERY_REPOSITORY } from './domain/gallery.repository';
import { GalleryRepositoryImpl } from './infrastructure/repositories/gallery.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: GALLERY_REPOSITORY,
            useClass: GalleryRepositoryImpl,
        },
    ],
    exports: [GALLERY_REPOSITORY],
})
export class GalleryRepositoryModule { }
