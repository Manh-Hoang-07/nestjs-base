import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthService } from '@/common/auth/services';
import { CacheService } from '@/common/cache/services';
import { ContextModule } from '@/modules/core/context/context.module';
import { EncryptionModule } from './encryption/encryption.module';
import { EncryptionService } from './encryption/encryption.service';

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
    EncryptionModule,
  ],
  providers: [AuthService, CacheService, EncryptionService],
  exports: [AuthService, CacheService, ContextModule, EncryptionModule, EncryptionService],
})
export class CommonModule { }

