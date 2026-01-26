import { IsString, IsOptional, IsEnum, IsNumber, IsObject } from 'class-validator';
import { NotificationType } from '@/shared/enums/types/notification-type.enum';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

export class CreateNotificationDto {
  @IsNumber()
  user_id: number;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  @IsEnum(BasicStatus)
  status?: BasicStatus;

  @IsOptional()
  @IsNumber()
  created_user_id?: number;
}
