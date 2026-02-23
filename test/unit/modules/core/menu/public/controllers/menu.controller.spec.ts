import { Test, TestingModule } from '@nestjs/testing';
import { PublicMenuController } from '@/modules/core/menu/public/controllers/menu.controller';
import { MenuService } from '@/modules/core/menu/admin/services/menu.service';
import { AuthService } from '@/common/auth/services';

describe('PublicMenuController', () => {
    let controller: PublicMenuController;
    let service: any;
    let auth: any;

    beforeEach(async () => {
        service = { getUserMenus: jest.fn() };
        auth = { id: jest.fn().mockReturnValue(1) };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PublicMenuController],
            providers: [
                { provide: MenuService, useValue: service },
                { provide: AuthService, useValue: auth },
            ],
        }).compile();

        controller = module.get<PublicMenuController>(PublicMenuController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call service.getUserMenus with client group', async () => {
        await controller.getPublicMenus();
        expect(service.getUserMenus).toHaveBeenCalledWith(1, { group: 'client' });
    });
});




