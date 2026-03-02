import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PUBLIC_CHAPTER_STATUSES } from '@/shared/enums';

@Injectable()
export class SeedComicLastChapter {
  constructor(private readonly prisma: PrismaService) { }

  async seed(): Promise<void> {
    try {
      const comics = await this.prisma.comic.findMany({
        where: {},
        select: { id: true, title: true },
        orderBy: { id: 'asc' },
      });

      if (comics.length === 0) return;

      for (const comic of comics) {
        try {
          const lastChapter = await this.prisma.chapter.findFirst({
            where: {
              comic_id: comic.id,
              status: { in: PUBLIC_CHAPTER_STATUSES },
            },
            orderBy: { created_at: 'desc' },
            select: { id: true, created_at: true },
          });

          await this.prisma.comic.update({
            where: { id: comic.id },
            data: {
              last_chapter_id: lastChapter?.id || null,
              last_chapter_updated_at: lastChapter?.created_at || null,
            },
          });
        } catch (error) {
          // Ignore error for individual comic
        }
      }
    } catch (error) {
      throw error;
    }
  }
}


