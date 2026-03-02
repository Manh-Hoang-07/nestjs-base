import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { PostStatus } from '@/shared/enums/types/post-status.enum';
import { PostType } from '@/shared/enums/types/post-type.enum';
import { StringUtil } from '@/core/utils/string.util';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedPosts {
    constructor(private readonly prisma: PrismaService) { }

    async seed(): Promise<void> {
        const existingCount = await this.prisma.post.count();
        if (existingCount > 0) return;

        const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'content');
        const postsConfig: any = JSON.parse(fs.readFileSync(path.join(baseDir, 'posts.json'), 'utf8'));

        const adminUser = await this.prisma.user.findFirst({ where: { username: 'systemadmin' } });
        const defaultUserId = adminUser ? adminUser.id : null;

        // ========== SEED POST CATEGORIES ==========
        const createdCategories = new Map<string, any>();
        for (const category of postsConfig.categories) {
            const slug = StringUtil.toSlug(category.name);
            const saved = await this.prisma.postCategory.create({
                data: {
                    ...category,
                    slug,
                    status: category.status as BasicStatus,
                    created_user_id: defaultUserId,
                    updated_user_id: defaultUserId,
                },
            });
            createdCategories.set(category.name, saved);
        }

        // ========== SEED POST TAGS ==========
        const createdTags = new Map<string, any>();
        for (const tag of postsConfig.tags) {
            const slug = StringUtil.toSlug(tag.name);
            const saved = await this.prisma.postTag.create({
                data: {
                    ...tag,
                    slug,
                    status: tag.status as BasicStatus,
                    meta_title: `${tag.name} - Bài viết liên quan`,
                    meta_description: tag.description,
                    created_user_id: defaultUserId,
                    updated_user_id: defaultUserId,
                },
            });
            createdTags.set(tag.name, saved);
        }

        // ========== SEED POSTS ==========
        for (const post of postsConfig.posts) {
            const slug = StringUtil.toSlug(post.name);
            const category = createdCategories.get(post.category_name);

            if (!category) continue;

            await this.prisma.post.create({
                data: {
                    name: post.name,
                    slug,
                    excerpt: post.excerpt,
                    content: post.content,
                    image: post.image,
                    cover_image: post.cover_image,
                    primary_postcategory_id: category.id,
                    status: post.status as PostStatus,
                    post_type: post.post_type as PostType,
                    is_featured: post.is_featured,
                    is_pinned: post.is_pinned,
                    published_at: new Date(post.published_at),
                    view_count: BigInt(post.view_count),
                    meta_title: post.meta_title,
                    meta_description: post.meta_description,
                    og_title: post.meta_title,
                    og_description: post.meta_description,
                    og_image: post.image,
                    created_user_id: defaultUserId,
                    updated_user_id: defaultUserId,
                    categories: {
                        create: { postcategory_id: category.id },
                    },
                    tags: {
                        create: (post.tags as string[]).map(tagName => {
                            const tag = createdTags.get(tagName);
                            return tag ? { posttag_id: tag.id } : null;
                        }).filter(Boolean) as any[],
                    },
                },
            });
        }
    }

    async clear(): Promise<void> {
        await this.prisma.postPosttag.deleteMany({});
        await this.prisma.postPostcategory.deleteMany({});
        await this.prisma.post.deleteMany({});
        await this.prisma.postTag.deleteMany({});
        await this.prisma.postCategory.deleteMany({});
    }
}

