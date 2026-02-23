import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email đăng nhập của người dùng',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email không được để trống.' })
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập',
    minLength: 6,
    example: 'P@ssw0rd',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' })
  password: string;

  @ApiPropertyOptional({
    description: 'Ghi nhớ đăng nhập hay không',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  remember?: boolean;
}


