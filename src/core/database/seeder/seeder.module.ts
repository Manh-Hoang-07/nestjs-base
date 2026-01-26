import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/database/prisma/prisma.module';
import { SeedService } from '@/core/database/seeder/seed-data';
import { SeedPermissions } from '@/core/database/seeder/seed-permissions';
import { SeedRoles } from '@/core/database/seeder/seed-roles';
import { SeedUsers } from '@/core/database/seeder/seed-users';
import { SeedMenus } from '@/core/database/seeder/seed-menus';
import { SeedBannerLocations } from '@/core/database/seeder/seed-banner-locations';
import { SeedBanners } from '@/core/database/seeder/seed-banners';
import { SeedContacts } from '@/core/database/seeder/seed-contacts';
import { SeedGeneralConfigs } from '@/core/database/seeder/seed-general-configs';
import { SeedEmailConfigs } from '@/core/database/seeder/seed-email-configs';
import { SeedGroups } from '@/core/database/seeder/seed-groups';
import { SeedProjects } from '@/core/database/seeder/seed-projects';
import { SeedAboutSections } from '@/core/database/seeder/seed-about-sections';
import { SeedStaff } from '@/core/database/seeder/seed-staff';
import { SeedTestimonials } from '@/core/database/seeder/seed-testimonials';
import { SeedPartners } from '@/core/database/seeder/seed-partners';
import { SeedGallery } from '@/core/database/seeder/seed-gallery';
import { SeedCertificates } from '@/core/database/seeder/seed-certificates';
import { SeedFaqs } from '@/core/database/seeder/seed-faqs';
import { SeedPosts } from '@/core/database/seeder/seed-posts';

import { SeedContentTemplates } from '@/core/database/seeder/seed-content-templates';

@Module({
  imports: [PrismaModule],
  providers: [
    // Main seed service
    SeedService,
    // Individual seeders
    SeedPermissions,
    SeedRoles,
    SeedUsers,
    SeedMenus,
    SeedBannerLocations,
    SeedBanners,
    SeedContacts,
    SeedGeneralConfigs,
    SeedEmailConfigs,
    SeedGroups,
    SeedContentTemplates,
    // Introduction Seeders
    SeedProjects,
    SeedAboutSections,
    SeedStaff,
    SeedTestimonials,
    SeedPartners,
    SeedGallery,
    SeedCertificates,
    SeedFaqs,
    // Post Module Seeders
    SeedPosts,
  ],
  exports: [SeedService],
})
export class SeederModule { }

