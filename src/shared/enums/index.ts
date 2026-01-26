/**
 * Enum System - Auto-export tất cả enum files
 * Chỉ cần tạo file mới trong types/, thêm export * vào đây là xong
 */

// Export tất cả enum files - tự động scan và load
export * from './types/basic-status.enum';
export * from './types/gender.enum';
export * from './types/user-status.enum';
export * from './types/review-status.enum';
export * from './types/contact-status.enum';
export * from './types/comment-status.enum';
export * from './types/notification-type.enum';
export * from './types/menu-type.enum';
export * from './types/banner-link-target.enum';
export * from './types/project-status.enum';
export * from './types/about-section-type.enum';
export * from './types/partner-type.enum';
export * from './types/certificate-type.enum';
export * from './types/post-status.enum';
export * from './types/post-type.enum';
export * from './types/template-category.enum';
export * from './types/template-type.enum';

// Interfaces
export { EnumValueMetadata } from './interfaces/enum-metadata.interface';

// DTOs
export { EnumValueMetadataDto, EnumResponseDto, AllEnumsResponseDto } from './dtos/enum-response.dto';

// Module
export { EnumModule } from './enum.module';
export { EnumService } from './services/enum.service';
export { EnumController } from './controllers/enum.controller';
