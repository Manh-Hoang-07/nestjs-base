import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
    @ApiProperty({
      description: 'Email nhận mã OTP',
      example: 'user@example.com',
    })
    @IsNotEmpty({ message: 'Email không được để trống.' })
    @IsEmail({}, { message: 'Email không hợp lệ.' })
    email: string;
}
