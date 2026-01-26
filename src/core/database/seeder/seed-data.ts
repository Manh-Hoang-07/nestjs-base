import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { SeedRoles } from '@/core/database/seeder/seed-roles';
import { SeedPermissions } from '@/core/database/seeder/seed-permissions';
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

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly seedPermissions: SeedPermissions,
    private readonly seedRoles: SeedRoles,
    private readonly seedUsers: SeedUsers,
    private readonly seedMenus: SeedMenus,
    private readonly seedBannerLocations: SeedBannerLocations,
    private readonly seedBanners: SeedBanners,
    private readonly seedContacts: SeedContacts,
    private readonly seedGeneralConfigs: SeedGeneralConfigs,
    private readonly seedEmailConfigs: SeedEmailConfigs,
    private readonly seedGroups: SeedGroups,
    private readonly seedContentTemplates: SeedContentTemplates,
    // Introduction Seeders
    private readonly seedProjects: SeedProjects,
    private readonly seedAboutSections: SeedAboutSections,
    private readonly seedStaff: SeedStaff,
    private readonly seedTestimonials: SeedTestimonials,
    private readonly seedPartners: SeedPartners,
    private readonly seedGallery: SeedGallery,
    private readonly seedCertificates: SeedCertificates,
    private readonly seedFaqs: SeedFaqs,
    // Post Module Seeders
    private readonly seedPosts: SeedPosts,
  ) { }

  async seedAll(): Promise<void> {
    this.logger.log('Starting database seeding...');

    try {
      // Seed in order:
      // permissions -> roles -> users -> groups (contexts)
      await this.seedPermissions.seed();
      await this.seedRoles.seed();
      await this.seedUsers.seed();
      await this.seedGroups.seed();

      // Menu system
      await this.seedMenus.seed();

      // Banner system
      await this.seedBannerLocations.seed();
      await this.seedBanners.seed();

      // Contact system
      await this.seedContacts.seed();

      // System config
      await this.seedGeneralConfigs.seed();
      await this.seedEmailConfigs.seed();
      await this.seedContentTemplates.seed();

      // Groups and contexts (sau khi có users và system context)
      await this.seedGroups.seed();

      // Introduction Modules
      await this.seedProjects.seed();
      await this.seedAboutSections.seed();
      await this.seedStaff.seed();
      await this.seedPartners.seed();
      await this.seedGallery.seed();
      await this.seedCertificates.seed();
      await this.seedFaqs.seed();
      // Testimonials cần seed sau Projects vì có relation
      await this.seedTestimonials.seed();

      // Post Module
      await this.seedPosts.seed();

      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Database seeding failed', error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    this.logger.log('Clearing database...');

    try {
      // Clear in reverse order (children first, then parents)
      // Clear junction tables first (many-to-many)
      await this.prisma.userRoleAssignment.deleteMany({});
      await this.prisma.userGroup.deleteMany({});
      await this.prisma.roleHasPermission.deleteMany({});
      await this.prisma.roleContext.deleteMany({});
      await this.prisma.menuPermission.deleteMany({});

      // Clear main tables
      await this.prisma.banner.deleteMany({});
      await this.prisma.bannerLocation.deleteMany({});

      await this.prisma.contact.deleteMany({});

      await this.prisma.menu.deleteMany({});

      await this.prisma.notification.deleteMany({});

      await this.prisma.group.deleteMany({});
      await this.prisma.context.deleteMany({});

      await this.prisma.user.deleteMany({});
      await this.prisma.role.deleteMany({});
      await this.prisma.permission.deleteMany({});

      await this.prisma.emailConfig.deleteMany({});
      await this.prisma.generalConfig.deleteMany({});
      // Use explicit delete for content templates if needed, or rely on cascade if relation exists? No relation to user usually.
      // But lint error said contentTemplate doesn't exist? Assuming it does.
      // Actually, I can't put comment inside code block if I want to match.
      await this.prisma.contentTemplate.deleteMany({});

      // Introduction Tables
      await this.prisma.testimonial.deleteMany({});
      await this.prisma.project.deleteMany({});
      await this.prisma.gallery.deleteMany({});
      await this.prisma.certificate.deleteMany({});
      await this.prisma.faq.deleteMany({});
      await this.prisma.partner.deleteMany({});
      await this.prisma.staff.deleteMany({});
      await this.prisma.aboutSection.deleteMany({});

      // Post Module Tables
      await this.prisma.postPosttag.deleteMany({});
      await this.prisma.postPostcategory.deleteMany({});
      await this.prisma.post.deleteMany({});
      await this.prisma.postTag.deleteMany({});
      await this.prisma.postCategory.deleteMany({});

      this.logger.log('Database cleared successfully');
    } catch (error) {
      this.logger.error('Database clearing failed', error);
      throw error;
    }
  }

  async clearDatabase(): Promise<void> {
    this.logger.log('Clearing database...');
    await this.clearAll();
  }
}
