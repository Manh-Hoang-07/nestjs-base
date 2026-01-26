import { Module } from '@nestjs/common';
import { HomepageController } from '@/modules/homepage/controllers/homepage.controller';
import { HomepageService } from '@/modules/homepage/services/homepage.service';
import { PublicProjectModule } from '@/modules/introduction/project/public/project.module';
import { PublicAboutModule } from '@/modules/introduction/about/public/about.module';
import { PublicStaffModule } from '@/modules/introduction/staff/public/staff.module';
import { PublicTestimonialModule } from '@/modules/introduction/testimonial/public/testimonial.module';
import { PublicPartnerModule } from '@/modules/introduction/partner/public/partner.module';
import { PublicGalleryModule } from '@/modules/introduction/gallery/public/gallery.module';
import { PublicCertificateModule } from '@/modules/introduction/certificate/public/certificate.module';
import { PublicFaqModule } from '@/modules/introduction/faq/public/faq.module';

@Module({
  imports: [
    // CommonModule là @Global() nên không cần import
    PublicProjectModule,
    PublicAboutModule,
    PublicStaffModule,
    PublicTestimonialModule,
    PublicPartnerModule,
    PublicGalleryModule,
    PublicCertificateModule,
    PublicFaqModule,
  ],
  controllers: [HomepageController],
  providers: [HomepageService],
  exports: [HomepageService],
})
export class HomepageModule {}

