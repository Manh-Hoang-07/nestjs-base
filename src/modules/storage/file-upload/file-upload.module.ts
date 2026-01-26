import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './controllers/upload.controller';
import { UploadService } from './services/upload.service';
import { FileValidationService } from './services/file-validation.service';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';
import { S3StorageStrategy } from './strategies/s3-storage.strategy';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [
    UploadService,
    FileValidationService,
    LocalStorageStrategy,
    S3StorageStrategy,
  ],
  exports: [UploadService],
})
export class FileUploadModule {}

