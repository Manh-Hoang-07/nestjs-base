import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Match } from '@/common/shared/validators';

export class UserChangePasswordDto {
    @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống.' })
    @IsString()
    old_password: string;

    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống.' })
    @IsString()
    @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' })
    password: string;

    @IsNotEmpty({ message: 'Xác nhận mật khẩu mới không được để trống.' })
    @IsString()
    @Match('password', { message: 'Xác nhận mật khẩu mới không khớp.' })
    password_confirmation: string;
}
