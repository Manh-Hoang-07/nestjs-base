import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy stats của comic
   */
  async getComicStats(comicId: number) {
    const comic = await this.prisma.comic.findUnique({ where: { id: BigInt(comicId) } });
    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    const stats = await this.prisma.comicStats.findUnique({ where: { comic_id: BigInt(comicId) } });
    
    return {
      comic_id: comicId,
      view_count: Number(stats?.view_count || 0n),
      follow_count: Number(stats?.follow_count || 0n),
      rating_count: Number(stats?.rating_count || 0n),
      rating_average: stats && Number(stats.rating_count || 0n) > 0
        ? (Number(stats.rating_sum || 0n) / Number(stats.rating_count)).toFixed(2)
        : '0',
    };
  }
}

