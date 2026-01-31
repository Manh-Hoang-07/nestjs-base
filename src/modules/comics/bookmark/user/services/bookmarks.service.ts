import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { RequestContext } from '@/common/utils/request-context.util';
import { toPlain } from '@/common/base/services/prisma/prisma.utils';

@Injectable()
export class BookmarksService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getByUser(userId: number) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { user_id: userId },
      include: {
        chapter: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return toPlain(bookmarks);
  }

  async create(chapterId: number, pageNumber: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const bookmark = await this.prisma.bookmark.create({
      data: {
        user_id: userId,
        chapter_id: chapterId,
        page_number: pageNumber,
      },
      include: {
        chapter: true,
      },
    });
    return toPlain(bookmark);
  }

  async delete(id: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await this.prisma.bookmark.deleteMany({
      where: {
        id: id,
        user_id: userId,
      },
    });

    return { deleted: true };
  }
}



