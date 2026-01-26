import { Module } from '@nestjs/common';
import { PublicTestimonialService } from '@/modules/introduction/testimonial/public/services/testimonial.service';
import { PublicTestimonialController } from '@/modules/introduction/testimonial/public/controllers/testimonial.controller';

import { TestimonialRepositoryModule } from '@/modules/introduction/testimonial/testimonial.repository.module';

@Module({
  imports: [TestimonialRepositoryModule],
  controllers: [PublicTestimonialController],
  providers: [PublicTestimonialService],
  exports: [PublicTestimonialService],
})
export class PublicTestimonialModule { }

