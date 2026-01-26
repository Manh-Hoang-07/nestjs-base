import { IsNotEmpty, IsString, MinLength, Matches, IsEmail } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Email không được để trống.' })
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  email: string;

  @IsNotEmpty({ message: 'Mã OTP không được để trống.' })
  @IsString()
  otp: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống.' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' })
  password: string;

  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống.' })
  @IsString()
  @MinLength(6, { message: 'Xác nhận mật khẩu phải có ít nhất 6 ký tự.' })
  confirmPassword: string;
}

