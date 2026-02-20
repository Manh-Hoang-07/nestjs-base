import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as path from 'path';
import { IUploadStrategy, UploadResult } from '../interfaces/upload-strategy.interface';

@Injectable()
export class S3StorageStrategy implements IUploadStrategy {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly baseUrl: string;
  private readonly forcePathStyle: boolean;

  constructor(private readonly configService: ConfigService) {
    const s3Config = this.configService.get('storage.s3');
    const endpoint = (s3Config?.endpoint || '').replace(/\/$/, '');
    this.bucket = s3Config?.bucket;
    this.forcePathStyle = s3Config?.forcePathStyle ?? true;

    this.s3Client = new S3Client({
      region: s3Config?.region,
      endpoint: endpoint || undefined,
      credentials: {
        accessKeyId: s3Config?.accessKeyId,
        secretAccessKey: s3Config?.secretAccessKey,
      },
      forcePathStyle: this.forcePathStyle,
    });

    // Dùng nguyên giá trị baseUrl từ config/env, chỉ bỏ trailing slash nếu có.
    // Người dùng tự cấu hình đúng URL mong muốn (ví dụ: https://minio1.webtui.vn:9000/bucket-s3monmon).
    const rawBaseUrl = s3Config?.baseUrl || '';
    this.baseUrl = rawBaseUrl.replace(/\/$/, '');
  }

  async upload(file: Express.Multer.File): Promise<UploadResult> {
    if (!this.bucket) {
      throw new Error('S3 bucket is not configured');
    }

    // Tạo tên file unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomString}${ext}`;

    // Upload lên S3/MinIO
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      // Bắt các lỗi cụ thể từ AWS SDK để trả về message dễ hiểu hơn
      if (error.name === 'DeserializationError' || error.message?.includes('Deserialization error')) {
        const response = (error as any).$response;
        let details = '';
        if (response) {
          details = ` (Status: ${response.statusCode})`;
        }
        throw new BadRequestException(`S3 Storage Error: Failed to parse response from storage provider${details}. Please check your S3/MinIO endpoint and credentials. Original error: ${error.message}`);
      }
      throw error;
    }

    // Tạo URL để truy cập file (đảm bảo baseUrl không có trailing slash)
    const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const url = `${baseUrl}/${filename}`;

    return {
      path: filename, // Key trong S3
      url,
      filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}

