import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../services/upload.service';
import { FileValidationService } from '../services/file-validation.service';
import { Permission } from '@/common/auth/decorators';
import { UploadResponseDto } from '../dtos/upload-response.dto';
import { Throttle } from '@nestjs/throttler/dist/throttler.decorator';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly fileValidationService: FileValidationService,
  ) {
  }

  @Permission('public')
  @Post('file')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        // Keep this aligned with default storage.maxFileSize (10MB) to avoid large in-memory buffers.
        // The FileValidationService also double-checks using config.
        fileSize: 10485760,
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate type + content + size, and sanitize name
    const { sanitizedOriginalName } = this.fileValidationService.validateFile(file);
    file.originalname = sanitizedOriginalName;

    return this.uploadService.uploadFile(file);
  }

  @Permission('public')
  @Post('files')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        // Keep this aligned with default storage.maxFileSize (10MB) to avoid large in-memory buffers.
        // The FileValidationService also double-checks using config.
        fileSize: 10485760,
      },
    }),
  )
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]): Promise<UploadResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Files are required');
    }

    // Validate each file (type + content + size) and sanitize names
    for (const file of files) {
      const { sanitizedOriginalName } = this.fileValidationService.validateFile(file);
      file.originalname = sanitizedOriginalName;
    }

    return this.uploadService.uploadFiles(files);
  }
}

