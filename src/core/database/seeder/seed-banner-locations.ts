import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedBannerLocations {
    constructor(private readonly prisma: PrismaService) { }

    async seed(): Promise<void> {
        const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'system');
        const data: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'banner-locations.json'), 'utf8'));

        for (const loc of data) {
            await this.prisma.bannerLocation.upsert({
                where: { code: loc.code },
                update: {},
                create: loc,
            });
        }
    }

    async clear(): Promise<void> {
        await this.prisma.bannerLocation.deleteMany({});
    }
}
