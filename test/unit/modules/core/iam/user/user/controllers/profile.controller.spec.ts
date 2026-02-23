import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from '@/modules/core/iam/user/user/controllers/profile.controller';
import { UserService } from '@/modules/core/iam/user/admin/services/user.service';
import { Auth } from '@/common/auth/utils';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/auth/guards';

jest.mock('@/common/auth/utils', () => ({
    Auth: {
        id: jest.fn(),
    },
}));

describe('ProfileController', () => {
    let controller: ProfileController;
    let userService: any;

    beforeEach(async () => {
        userService = {
            getOne: jest.fn(),
            updateById: jest.fn(),
            userChangePassword: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProfileController],
            providers: [
                { provide: UserService, useValue: userService },
            ],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .compile();

        controller = module.get<ProfileController>(ProfileController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getMe', () => {
        it('should throw UnauthorizedException if no userId', async () => {
            (Auth.id as jest.Mock).mockReturnValue(null);
            await expect(controller.getMe()).rejects.toThrow(UnauthorizedException);
        });

        it('should return user from service', async () => {
            (Auth.id as jest.Mock).mockReturnValue(1);
            userService.getOne.mockResolvedValue({ id: 1, name: 'Me' });
            const result = await controller.getMe();
            expect(result.name).toBe('Me');
        });
    });

    describe('updateMe', () => {
        it('should split data into userFields and profileData', async () => {
            (Auth.id as jest.Mock).mockReturnValue(1);
            const dto = {
                name: 'New Name',
                birthday: '1990-01-01',
                gender: 'male',
                other: 'ignore'
            };

            await controller.updateMe(dto as any);

            expect(userService.updateById).toHaveBeenCalledWith(1, {
                name: 'New Name',
                profile: {
                    birthday: '1990-01-01',
                    gender: 'male'
                }
            });
        });
    });
});




