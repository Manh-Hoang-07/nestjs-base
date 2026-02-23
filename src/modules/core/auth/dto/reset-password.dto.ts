import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email dùng để khôi phục mật khẩu',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email không được để trống.' })
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  email: string;

  @ApiProperty({
    description: 'Mã OTP gửi về email',
    example: '123456',
  })
  @IsNotEmpty({ message: 'Mã OTP không được để trống.' })
  @IsString()
  otp: string;

  @ApiProperty({
    description: 'Mật khẩu mới',
    minLength: 6,
    example: 'NewP@ssw0rd',
  })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống.' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' })
  password: string;

  @ApiProperty({
    description: 'Xác nhận mật khẩu mới',
    minLength: 6,
    example: 'NewP@ssw0rd',
  })
  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống.' })
  @IsString()
  @MinLength(6, { message: 'Xác nhận mật khẩu phải có ít nhất 6 ký tự.' })
  confirmPassword: string;
}

