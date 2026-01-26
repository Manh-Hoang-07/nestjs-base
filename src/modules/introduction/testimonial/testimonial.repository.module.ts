import { Global, Module } from '@nestjs/common';
import { TESTIMONIAL_REPOSITORY } from './domain/testimonial.repository';
import { TestimonialRepositoryImpl } from './infrastructure/repositories/testimonial.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: TESTIMONIAL_REPOSITORY,
            useClass: TestimonialRepositoryImpl,
        },
    ],
    exports: [TESTIMONIAL_REPOSITORY],
})
export class TestimonialRepositoryModule { }
