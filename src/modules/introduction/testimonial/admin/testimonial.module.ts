import { Module } from '@nestjs/common';
import { TestimonialService } from '@/modules/introduction/testimonial/admin/services/testimonial.service';
import { TestimonialController } from '@/modules/introduction/testimonial/admin/controllers/testimonial.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

import { TestimonialRepositoryModule } from '@/modules/introduction/testimonial/testimonial.repository.module';
import { ProjectRepositoryModule } from '@/modules/introduction/project/project.repository.module';

@Module({
  imports: [
    RbacModule,
    TestimonialRepositoryModule,
    ProjectRepositoryModule,
  ],
  controllers: [TestimonialController],
  providers: [TestimonialService],
  exports: [TestimonialService],
})
export class AdminTestimonialModule { }

