import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Match } from '@/common/shared/validators';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Họ tên người dùng',
    maxLength: 255,
    example: 'Nguyễn Văn A',
  })
  @IsNotEmpty({ message: 'Họ tên không được để trống.' })
  @IsString()
  @MaxLength(255, { message: 'Họ tên không được vượt quá 255 ký tự.' })
  name: string;

  @ApiPropertyOptional({
    description: 'Tên đăng nhập (nếu bỏ trống sẽ dùng email)',
    maxLength: 50,
    example: 'nguyenvana',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @ApiProperty({
    description: 'Email đăng ký',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email không được để trống.' })
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  email: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại',
    maxLength: 20,
    example: '0912345678',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    description: 'Mật khẩu',
    minLength: 8,
    example: 'StrongP@ssw0rd',
  })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' })
  password: string;

  @ApiProperty({
    description: 'Xác nhận mật khẩu',
    example: 'StrongP@ssw0rd',
  })
  @IsString()
  @Match('password', { message: 'Xác nhận mật khẩu không khớp.' })
  confirmPassword: string;

  @ApiProperty({
    description: 'Mã OTP gửi về email để xác thực đăng ký',
    example: '123456',
  })
  @IsNotEmpty({ message: 'Mã OTP không được để trống.' })
  @IsString()
  otp: string;
}


