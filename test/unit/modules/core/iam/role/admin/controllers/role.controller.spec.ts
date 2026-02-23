import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from '@/modules/core/iam/role/admin/controllers/role.controller';
import { RoleService } from '@/modules/core/iam/role/admin/services/role.service';
import { AuthService } from '@/common/auth/services';

describe('RoleController', () => {
    let controller: RoleController;
    let service: any;
    let auth: any;

    beforeEach(async () => {
        service = {
            getList: jest.fn(),
            getSimpleList: jest.fn(),
            getOne: jest.fn(),
            createWithAudit: jest.fn(),
            updateWithAudit: jest.fn(),
            deleteById: jest.fn(),
            assignPermissions: jest.fn(),
        };

        auth = {
            id: jest.fn().mockReturnValue(1),
            isLogin: jest.fn().mockReturnValue(true),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [RoleController],
            providers: [
                { provide: RoleService, useValue: service },
                { provide: AuthService, useValue: auth },
            ],
        }).compile();

        controller = module.get<RoleController>(RoleController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call createWithAudit', async () => {
            const dto = { name: 'Admin' };
            await controller.create(dto);
            expect(service.createWithAudit).toHaveBeenCalledWith(dto, 1);
        });

        it('should throw error if not authenticated', async () => {
            auth.id.mockReturnValue(null);
            await expect(controller.create({})).rejects.toThrow('User not authenticated');
        });
    });

    describe('assignPermissions', () => {
        it('should call service.assignPermissions', async () => {
            await controller.assignPermissions(1, { permission_ids: [10, 20] });
            expect(service.assignPermissions).toHaveBeenCalledWith(1, [10, 20]);
        });
    });
});




