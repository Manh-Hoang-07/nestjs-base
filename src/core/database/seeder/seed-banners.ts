import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedBanners {
    constructor(private readonly prisma: PrismaService) { }

    async seed(): Promise<void> {
        const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'system');
        const bannersData: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'banners.json'), 'utf8'));

        for (const bannerData of bannersData) {
            const location = await this.prisma.bannerLocation.findUnique({
                where: { code: bannerData.location_code },
            });
            if (!location) continue;

            const existingBanner = await this.prisma.banner.findFirst({
                where: { location_id: location.id },
            });
            if (existingBanner) continue;

            const { location_code, ...rest } = bannerData;
            await this.prisma.banner.create({
                data: {
                    ...rest,
                    location_id: location.id,
                },
            });
        }
    }

    async clear(): Promise<void> {
        await this.prisma.banner.deleteMany({});
    }
}
