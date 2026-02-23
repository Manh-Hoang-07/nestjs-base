import { Test, TestingModule } from '@nestjs/testing';
import { UserMenuController } from '@/modules/core/menu/user/controllers/menu.controller';
import { MenuService } from '@/modules/core/menu/admin/services/menu.service';
import { AuthService } from '@/common/auth/services';

describe('UserMenuController', () => {
    let controller: UserMenuController;
    let service: any;
    let auth: any;

    beforeEach(async () => {
        service = { getUserMenus: jest.fn() };
        auth = { id: jest.fn().mockReturnValue(1) };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserMenuController],
            providers: [
                { provide: MenuService, useValue: service },
                { provide: AuthService, useValue: auth },
            ],
        }).compile();

        controller = module.get<UserMenuController>(UserMenuController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call service.getUserMenus with admin group', async () => {
        await controller.getUserMenus();
        expect(service.getUserMenus).toHaveBeenCalledWith(1, { group: 'admin' });
    });
});




