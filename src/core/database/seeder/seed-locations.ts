import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedLocations {
    private readonly logger = new Logger(SeedLocations.name);

    constructor(private readonly prisma: PrismaService) { }

    async seed(): Promise<void> {
        this.logger.log('Seeding locations (countries, provinces, wards)...');

        const countryCount = await this.prisma.country.count();
        if (countryCount > 0) {
            this.logger.log('Location data already exists. Skipping seeding.');
            return;
        }

        const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'address');

        try {
            // 1. Seed Countries
            this.logger.log('Reading countries.json...');
            const countriesData = JSON.parse(fs.readFileSync(path.join(baseDir, 'countries.json'), 'utf8'));
            for (const country of countriesData) {
                await this.prisma.country.create({
                    data: {
                        id: country.id,
                        code: country.code,
                        code_alpha3: country.code_alpha3,
                        name: country.name,
                        official_name: country.official_name,
                        phone_code: country.phone_code,
                        currency_code: country.currency_code,
                        flag_emoji: country.flag_emoji,
                        status: country.status || 'active',
                    },
                });
            }
            this.logger.log(`Seeded ${countriesData.length} countries.`);

            // 2. Seed Provinces
            this.logger.log('Reading provinces.json...');
            const provincesData = JSON.parse(fs.readFileSync(path.join(baseDir, 'provinces.json'), 'utf8'));
            for (const province of provincesData) {
                await this.prisma.province.create({
                    data: {
                        id: province.id,
                        code: province.code,
                        name: province.name,
                        type: province.type,
                        phone_code: province.phone_code?.toString(),
                        country_id: province.country_id,
                        status: province.status || 'active',
                        note: province.note,
                        code_bnv: province.code_bnv?.toString(),
                        code_tms: province.code_tms?.toString(),
                    },
                });
            }
            this.logger.log(`Seeded ${provincesData.length} provinces.`);

            // 3. Seed Wards
            this.logger.log('Reading wards.json...');
            const wardsData = JSON.parse(fs.readFileSync(path.join(baseDir, 'wards.json'), 'utf8'));

            // Batch insert for wards since it's large (23k+ records)
            const batchSize = 1000;
            for (let i = 0; i < wardsData.length; i += batchSize) {
                const batch = wardsData.slice(i, i + batchSize).map((ward: any) => ({
                    id: ward.id,
                    province_id: ward.province_id,
                    name: ward.name,
                    type: ward.type,
                    code: ward.code?.toString(),
                    status: 'active',
                }));

                await this.prisma.ward.createMany({
                    data: batch,
                });

                if (i % 5000 === 0) {
                    this.logger.log(`Seeded ${i + batch.length}/${wardsData.length} wards...`);
                }
            }
            this.logger.log(`Seeded ${wardsData.length} wards.`);

            this.logger.log('Location seeding completed successfully!');
        } catch (error) {
            this.logger.error('Error seeding locations:', error);
            throw error;
        }
    }

    async clear(): Promise<void> {
        this.logger.log('Clearing location data...');
        // Order matters because of foreign keys
        await this.prisma.ward.deleteMany({});
        await this.prisma.province.deleteMany({});
        await this.prisma.country.deleteMany({});
    }
}
