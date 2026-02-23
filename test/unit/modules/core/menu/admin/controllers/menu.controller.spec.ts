import { Test, TestingModule } from '@nestjs/testing';
import { AdminMenuController } from '@/modules/core/menu/admin/controllers/menu.controller';
import { MenuService } from '@/modules/core/menu/admin/services/menu.service';
import { AuthService } from '@/common/auth/services';

describe('AdminMenuController', () => {
    let controller: AdminMenuController;
    let service: any;
    let auth: any;

    beforeEach(async () => {
        service = {
            getList: jest.fn(),
            getSimpleList: jest.fn(),
            getTree: jest.fn(),
            getOne: jest.fn(),
            createWithUser: jest.fn(),
            updateById: jest.fn(),
            deleteById: jest.fn(),
        };
        auth = { id: jest.fn().mockReturnValue(1) };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AdminMenuController],
            providers: [
                { provide: MenuService, useValue: service },
                { provide: AuthService, useValue: auth },
            ],
        }).compile();

        controller = module.get<AdminMenuController>(AdminMenuController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call service.getTree', async () => {
        await controller.getTree();
        expect(service.getTree).toHaveBeenCalled();
    });
});




