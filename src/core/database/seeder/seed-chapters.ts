import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { ChapterStatus } from '@/shared/enums';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedChapters {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    const existingChapters = await this.prisma.chapter.count();
    if (existingChapters > 0) return;

    const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'comic');
    const config: any = JSON.parse(fs.readFileSync(path.join(baseDir, 'comic-config.json'), 'utf8'));
    const cmangaData: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'cmanga.json'), 'utf8'));

    const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
    const defaultUserId = adminUser ? adminUser.id : BigInt(1);

    const comics = await this.prisma.comic.findMany();
    if (comics.length === 0) return;

    const systemGroup = await this.prisma.group.findFirst({ where: { code: 'system' } });
    const groupId = systemGroup ? systemGroup.id : null;

    const popularComics: string[] = config.popular_comics;
    const { min: popMin, max: popMax } = config.popular_chapters_range;
    const { min: defMin, max: defMax } = config.default_chapters_range;
    const { min: pageMin, max: pageMax } = config.pages_range;
    const chapterTitles: Record<string, string[]> = config.chapter_titles;

    for (const comic of comics) {
      const cmangaComic = cmangaData.find(c => c.slug === comic.slug);

      if (cmangaComic && cmangaComic.chapters) {
        for (const chap of cmangaComic.chapters) {
          const pages = chap.images.map((img: string, idx: number) => ({
            page_number: idx + 1,
            image_url: img,
            width: 800,
            height: 1200,
            file_size: Math.floor(Math.random() * 500000) + 100000,
          }));

          await this.prisma.chapter.create({
            data: {
              comic_id: comic.id,
              title: chap.title || `Chapter ${chap.chapter_index}`,
              chapter_index: chap.chapter_index,
              chapter_label: `Chương ${chap.chapter_index}`,
              status: ChapterStatus.published,
              group_id: groupId,
              view_count: BigInt(Math.floor(Math.random() * 5000) + 100),
              created_user_id: defaultUserId,
              updated_user_id: defaultUserId,
              pages: { create: pages },
            },
          });
        }
      } else {
        const isPopular = popularComics.includes(comic.slug);
        const chaptersCount = isPopular
          ? Math.floor(Math.random() * (popMax - popMin + 1)) + popMin
          : Math.floor(Math.random() * (defMax - defMin + 1)) + defMin;

        for (let i = 1; i <= chaptersCount; i++) {
          const pagesCount = Math.floor(Math.random() * (pageMax - pageMin + 1)) + pageMin;
          const pages = Array.from({ length: pagesCount }, (_, idx) => ({
            page_number: idx + 1,
            image_url: `https://via.placeholder.com/800x1200?text=${comic.title}+Ch${i}+Pg${idx + 1}`,
            width: 800,
            height: 1200,
            file_size: Math.floor(Math.random() * 500000) + 100000,
          }));

          const titlesForComic = chapterTitles[comic.slug];
          const title = titlesForComic && i <= titlesForComic.length
            ? titlesForComic[i - 1]
            : `Chapter ${i}`;

          await this.prisma.chapter.create({
            data: {
              comic_id: comic.id,
              title,
              chapter_index: i,
              chapter_label: `Chương ${i}`,
              status: ChapterStatus.published,
              group_id: groupId,
              view_count: BigInt(Math.floor(Math.random() * 5000) + 100),
              created_user_id: defaultUserId,
              updated_user_id: defaultUserId,
              pages: { create: pages },
            },
          });
        }
      }
    }
  }

  async clear(): Promise<void> {
    await this.prisma.chapterPage.deleteMany({});
    await this.prisma.chapter.deleteMany({});
  }
}

