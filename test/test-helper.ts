import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { SeedService } from '@/core/database/seeder/seed-data';
import { patchBigInt } from '@/bootstrap/bigint';
import { ConfigService } from '@nestjs/config';

export class TestHelper {
    private app: INestApplication;
    private moduleFixture: TestingModule;

    async init() {
        // Patch BigInt methods
        patchBigInt();

        this.moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        this.app = this.moduleFixture.createNestApplication();

        // Set global prefix from config
        const configService = this.app.get(ConfigService);
        const prefix = configService.get('app.globalPrefix', 'api');
        this.app.setGlobalPrefix(prefix);

        // Áp dụng các cấu hình giống như trong main.ts
        this.app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }));

        await this.app.init();
        return this.app;
    }

    async close() {
        if (this.app) {
            await this.app.close();
        }
    }

    getApp() {
        return this.app;
    }

    getPrisma() {
        return this.app.get(PrismaService);
    }

    getSeeder() {
        return this.app.get(SeedService);
    }

    /**
     * Dọn dẹp database trước khi chạy test
     */
    async clearDatabase() {
        const seeder = this.getSeeder();
        // Không xóa dữ liệu locations để tránh timeout và nâng cao hiệu năng
        await seeder.clearDatabase(false);
    }

    /**
     * Seed dữ liệu mẫu cơ bản (roles, permissions, admin user)
     */
    async seedBasicData() {
        const seeder = this.getSeeder();
        // Chúng ta có thể gọi từng phần nếu muốn nhanh hơn, 
        // hoặc gọi seedAll để có dữ liệu "như thật" hoàn chỉnh
        await seeder.seedAll();
    }
}
