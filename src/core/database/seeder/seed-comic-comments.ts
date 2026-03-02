import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { CommentStatus } from '@/shared/enums';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedComicComments {
    constructor(private readonly prisma: PrismaService) { }

    async seed(): Promise<void> {
        const existingComments = await this.prisma.comicComment.count();
        if (existingComments > 0) return;

        const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'comic');
        const config: any = JSON.parse(fs.readFileSync(path.join(baseDir, 'comic-config.json'), 'utf8'));

        const commentsData: string[] = config.comment_texts;
        const replyText: string = config.reply_text;

        const comics = await this.prisma.comic.findMany({ take: 10 });
        const users = await this.prisma.user.findMany({ take: 10 });

        if (comics.length === 0 || users.length === 0) return;

        for (const comic of comics) {
            const numComments = Math.floor(Math.random() * 3) + 3;

            for (let i = 0; i < numComments; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const content = commentsData[Math.floor(Math.random() * commentsData.length)];

                const comment = await this.prisma.comicComment.create({
                    data: {
                        content,
                        status: CommentStatus.visible,
                        user_id: user.id,
                        comic_id: comic.id,
                    },
                });

                if (Math.random() > 0.5) {
                    const replier = users[Math.floor(Math.random() * users.length)];
                    await this.prisma.comicComment.create({
                        data: {
                            content: replyText,
                            status: CommentStatus.visible,
                            user_id: replier.id,
                            comic_id: comic.id,
                            parent_id: comment.id,
                        },
                    });
                }
            }
        }
    }

    async clear(): Promise<void> {
        await this.prisma.comicComment.deleteMany({});
    }
}

