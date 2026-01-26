import { Body, Controller, Get, Patch, UseGuards, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@/modules/core/iam/user/admin/services/user.service';
import { UpdateProfileDto } from '@/modules/core/iam/user/admin/dtos/update-profile.dto';
import { UserChangePasswordDto } from '../dtos/user-change-password.dto';
import { Auth } from '@/common/auth/utils';
import { JwtAuthGuard } from '@/common/auth/guards';
import { LogRequest } from '@/common/shared/decorators';
import { Permission } from '@/common/auth/decorators';

@Controller('user/profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private readonly userService: UserService) { }

    @Permission('authenticated')
    @Get()
    async getMe() {
        const userId = Auth.id();
        if (!userId) throw new UnauthorizedException();

        return this.userService.getOne(Number(userId));
    }

    @Permission('authenticated')
    @LogRequest({ fileBaseName: 'user_update_profile' })
    @Patch()
    async updateMe(@Body() dto: UpdateProfileDto) {
        const userId = Auth.id();
        if (!userId) throw new UnauthorizedException();

        // Tự động phân loại: name, image thuộc User; các trường còn lại thuộc Profile
        const userFields = ['name', 'image'];
        const profileFields = ['birthday', 'gender', 'address', 'about'];

        const updatePayload: any = {};
        const profileData: any = {};
        const dtoAny = dto as any;

        // Phân loại dữ liệu
        Object.keys(dto).forEach(key => {
            if (userFields.includes(key)) {
                updatePayload[key] = dtoAny[key];
            } else if (profileFields.includes(key)) {
                profileData[key] = dtoAny[key];
            }
        });

        // Chỉ thêm profile vào payload nếu có dữ liệu
        if (Object.keys(profileData).length > 0) {
            updatePayload.profile = profileData;
        }

        return this.userService.updateById(Number(userId), updatePayload);
    }

    @Permission('authenticated')
    @LogRequest({ fileBaseName: 'user_change_password' })
    @Patch('change-password')
    async changePassword(@Body() dto: UserChangePasswordDto) {
        const userId = Auth.id();
        if (!userId) throw new UnauthorizedException();

        await this.userService.userChangePassword(Number(userId), dto.old_password, dto.password);
        return { success: true, message: 'Đổi mật khẩu thành công' };
    }
}
