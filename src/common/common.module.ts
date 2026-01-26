import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthService } from '@/common/auth/services';
import { CacheService } from '@/common/cache/services';
import { ContextModule } from '@/modules/core/context/context.module';

/**
 * Common Module - Cung cấp các services dùng chung
 * Module này được đặt là Global để có thể inject vào bất kỳ module nào
 */
@Global()
@Module({
  imports: [
    CacheModule.register({
      ttl: 300000, // 5 minutes default TTL
      max: 100, // Maximum number of items in cache
    }),
    ContextModule,
  ],
  providers: [AuthService, CacheService],
  exports: [AuthService, CacheService, ContextModule],
})
export class CommonModule { }

