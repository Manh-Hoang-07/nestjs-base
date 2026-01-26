import { Injectable, Inject } from '@nestjs/common';
import { IGalleryRepository, GALLERY_REPOSITORY } from '@/modules/introduction/gallery/domain/gallery.repository';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { BaseService } from '@/common/core/services';

@Injectable()
export class PublicGalleryService extends BaseService<any, IGalleryRepository> {
  constructor(
    @Inject(GALLERY_REPOSITORY)
    private readonly galleryRepo: IGalleryRepository,
  ) {
    super(galleryRepo);
  }

  protected async prepareFilters(filter: any) {
    // Public API chỉ hiển thị active, normalize featured/isFeatured
    const normalized = { ...filter };
    if (filter.featured !== undefined) {
      normalized.isFeatured = filter.featured;
      delete normalized.featured;
    }
    return { ...normalized, status: BasicStatus.active as any };
  }



  async findBySlug(slug: string): Promise<any | null> {
    const gallery = await this.galleryRepo.findOne({
      slug,
      status: BasicStatus.active as any,
    });

    return gallery ? this.transform(gallery) : null;
  }

  async getFeatured(limit: number = 10): Promise<any[]> {
    const result = await this.getList({
      featured: true,
      limit,
      page: 1,
    });
    return result.data as any[];
  }

  protected transform(gallery: any) {
    if (!gallery) return gallery;
    const item = super.transform(gallery) as any;

    // Normalize images
    if (item.images) {
      if (typeof item.images === 'string') {
        try {
          item.images = JSON.parse(item.images);
        } catch (e) {
          item.images = [];
        }
      }
      if (!Array.isArray(item.images)) {
        item.images = [];
      }
    } else {
      item.images = [];
    }

    return item;
  }
}

