import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PUBLIC_CHAPTER_STATUSES } from '@/shared/enums';

@Injectable()
export class SeedComicLastChapter {
  private readonly logger = new Logger(SeedComicLastChapter.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Backfill last_chapter_id và last_chapter_updated_at cho tất cả comics
   * Chạy sau khi đã seed comics và chapters
   */
  async seed(): Promise<void> {
    this.logger.log('Backfilling comic last chapter data...');

    try {
      // Lấy tất cả comics (không bị xóa)
      const comics = await this.prisma.comic.findMany({
        where: { deleted_at: null },
        select: { id: true, title: true },
        orderBy: { id: 'asc' },
      });

      if (comics.length === 0) {
        this.logger.warn('No comics found. Please seed comics first.');
        return;
      }

      this.logger.log(`Found ${comics.length} comics to process...`);

      let processed = 0;
      let updated = 0;
      let skipped = 0;

      for (const comic of comics) {
        try {
          // Tìm chapter mới nhất (published, không bị xóa)
          const lastChapter = await this.prisma.chapter.findFirst({
            where: {
              comic_id: comic.id,
              status: { in: PUBLIC_CHAPTER_STATUSES },
              deleted_at: null,
            },
            orderBy: { created_at: 'desc' },
            select: {
              id: true,
              created_at: true,
            },
          });

          // Update comic
          await this.prisma.comic.update({
            where: { id: comic.id },
            data: {
              last_chapter_id: lastChapter?.id || null,
              last_chapter_updated_at: lastChapter?.created_at || null,
            },
          });

          if (lastChapter) {
            updated++;
            this.logger.debug(
              `Updated comic "${comic.title}" with last chapter ID: ${lastChapter.id}`,
            );
          } else {
            skipped++;
            this.logger.debug(`Skipped comic "${comic.title}" (no published chapters)`);
          }

          processed++;

          // Log progress mỗi 50 comics
          if (processed % 50 === 0) {
            this.logger.log(
              `Progress: ${processed}/${comics.length} (Updated: ${updated}, Skipped: ${skipped})`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error processing comic ${comic.id} (${comic.title}): ${error.message}`,
          );
        }
      }

      this.logger.log('✅ Backfill comic last chapter completed!');
      this.logger.log(`   Total processed: ${processed}`);
      this.logger.log(`   Updated (with last chapter): ${updated}`);
      this.logger.log(`   Skipped (no published chapters): ${skipped}`);
    } catch (error) {
      this.logger.error(`❌ Backfill failed: ${error.message}`);
      throw error;
    }
  }
}

