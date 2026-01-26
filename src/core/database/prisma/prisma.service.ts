import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Đảm bảo đóng kết nối Prisma khi ứng dụng Nest shutdown.
   */
  async enableShutdownHooks(app: any) {
    // Cast để tương thích typing của PrismaClient.$on
    (this as any).$on('beforeExit', async () => {
      await app.close();
    });
  }
}

