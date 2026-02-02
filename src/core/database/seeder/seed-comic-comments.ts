
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { CommentStatus } from '@/shared/enums';

@Injectable()
export class SeedComicComments {
    private readonly logger = new Logger(SeedComicComments.name);

    constructor(private readonly prisma: PrismaService) { }

    async seed(): Promise<void> {
        this.logger.log('Seeding comic comments...');

        const existingComments = await this.prisma.comicComment.count();
        if (existingComments > 0) {
            this.logger.log('Comic comments already seeded, skipping...');
            return;
        }

        const comics = await this.prisma.comic.findMany({ take: 10 });
        const users = await this.prisma.user.findMany({ take: 10 });

        if (comics.length === 0 || users.length === 0) {
            this.logger.warn('No comics or users found. Skipping comment seeding.');
            return;
        }

        const commentsData = [
            "Truyện hay quá!",
            "Hóng chap mới.",
            "Art đẹp thực sự.",
            "Main bá đạo vãi.",
            "Cốt truyện cuốn hút quá.",
            "Dịch mượt, cảm ơn nhóm dịch.",
            "Chapter này combat mãn nhãn.",
            "Tội nghiệp nhân vật phụ quá.",
            "Khi nào có chap mới vậy ad?",
            "Truyện này siêu phẩm rồi."
        ];

        for (const comic of comics) {
            // Create 3-5 comments per comic
            const numComments = Math.floor(Math.random() * 3) + 3;

            for (let i = 0; i < numComments; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const content = commentsData[Math.floor(Math.random() * commentsData.length)];

                // Create root comment
                const comment = await this.prisma.comicComment.create({
                    data: {
                        content: content,
                        status: CommentStatus.visible,
                        user_id: user.id,
                        comic_id: comic.id,
                    }
                });

                // 50% chance to have a reply
                if (Math.random() > 0.5) {
                    const replier = users[Math.floor(Math.random() * users.length)];
                    await this.prisma.comicComment.create({
                        data: {
                            content: "Chuẩn luôn bác ơi!",
                            status: CommentStatus.visible,
                            user_id: replier.id,
                            comic_id: comic.id,
                            parent_id: comment.id
                        }
                    });
                }
            }
        }

        this.logger.log('Comic comments seeded successfully');
    }
}
