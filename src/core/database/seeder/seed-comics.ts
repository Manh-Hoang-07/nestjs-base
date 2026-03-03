import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { ComicStatus } from '@/shared/enums';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedComics {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    const existingComics = await this.prisma.comic.count();
    if (existingComics > 0) return;

    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'comic');
    const comicsData: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'comics.json'), 'utf8'));
    const cmangaData: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'cmanga.json'), 'utf8'));

    // Combine both data sets
    const allComicsData = [...comicsData, ...cmangaData];

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
    const defaultUserId = adminUser ? adminUser.id : BigInt(1);

    const categories = await this.prisma.comicCategory.findMany();
    if (categories.length === 0) return;

    const systemGroup = await this.prisma.group.findFirst({ where: { code: 'system' } });
    const groupId = systemGroup ? systemGroup.id : null;

    for (const comicData of allComicsData) {
      const comicCategories = categories.filter(cat =>
        (comicData.category_slugs as string[]).includes(cat.slug),
      );

      await this.prisma.comic.create({
        data: {
          slug: comicData.slug,
          title: comicData.title,
          description: comicData.description,
          author: comicData.author,
          status: comicData.status as ComicStatus,
          cover_image: comicData.cover_image,
          is_featured: comicData.is_featured ?? false,
          group_id: groupId,
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
          stats: {
            create: {
              view_count: BigInt(comicData.stats.view_count),
              follow_count: BigInt(comicData.stats.follow_count),
              rating_count: BigInt(comicData.stats.rating_count),
              rating_sum: BigInt(comicData.stats.rating_sum),
            },
          },
          categoryLinks: {
            create: comicCategories.map(cat => ({ comic_category_id: cat.id })),
          },
        },
      });
    }
  }

  async clear(): Promise<void> {
    await this.prisma.comicCategoryOnComic.deleteMany({});
    await this.prisma.comicStats.deleteMany({});
    await this.prisma.comic.deleteMany({});
  }
}

