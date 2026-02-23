import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RedisThrottlerStorageService } from './redis-throttler-storage.service';
import { RedisUtil } from '@/core/utils/redis.util';
import { AppThrottlerGuard } from './app-throttler.guard';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [RedisUtil],
      useFactory: (redis: RedisUtil) => {
        // Use Redis storage if available, otherwise fallback to in-memory
        const storage = redis.isEnabled()
          ? new RedisThrottlerStorageService(redis)
          : undefined; // undefined = use default in-memory storage

        return {
          throttlers: [{
            ttl: 60000, // 60 seconds = 1 phút
            limit: 100, // Default limit: 50 request mỗi phút cho mỗi IP
          }],
          storage,
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
  ],
  exports: [],
})
export class RateLimitModule { }
