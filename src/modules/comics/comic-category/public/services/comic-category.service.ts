import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaListService, PrismaListBag } from '@/common/base/services/prisma/prisma-list.service';

type ComicCategoryBag = PrismaListBag & {
  Model: any;
  Where: any;
  Select: any;
  Include: any;
  OrderBy: any;
};

@Injectable()
export class PublicComicCategoriesService extends PrismaListService<ComicCategoryBag> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.comicCategory, ['id', 'name', 'slug', 'created_at'], 'created_at:DESC');
  }

  protected override async prepareFilters(filters?: any, _options?: any): Promise<any> {
    // Luôn trả về object, không trả về undefined
    return filters || {};
  }

  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        created_at: true,
      },
    };
  }
}

