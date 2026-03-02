import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedContentTemplates {
    constructor(private readonly prisma: PrismaService) { }

    async seed(): Promise<void> {
        const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'system');
        const templates: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'content-templates.json'), 'utf8'));

        for (const data of templates) {
            const { code, name, content, type, category, status, metadata } = data;
            await this.prisma.contentTemplate.upsert({
                where: { code: code },
                update: { name, content, type, category, status, metadata: metadata as any },
                create: { code, name, content, type, category, status, metadata: metadata as any },
            });
        }
    }

    async clear(): Promise<void> {
        await this.prisma.contentTemplate.deleteMany({});
    }
}

