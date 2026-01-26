import { Module } from '@nestjs/common';

// Import admin modules
import { AdminTestimonialModule } from '@/modules/introduction/testimonial/admin/testimonial.module';

// Import public modules
import { PublicTestimonialModule } from '@/modules/introduction/testimonial/public/testimonial.module';
import { TestimonialRepositoryModule } from './testimonial.repository.module';

@Module({
  imports: [
    TestimonialRepositoryModule,
    // Admin modules
    AdminTestimonialModule,
    // Public modules
    PublicTestimonialModule,
  ],
  exports: [],
})
export class TestimonialModule { }

