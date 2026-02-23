import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from '@/modules/core/iam/permission/admin/controllers/permission.controller';
import { PermissionService } from '@/modules/core/iam/permission/admin/services/permission.service';
import { Auth } from '@/common/auth/utils';

jest.mock('@/common/auth/utils', () => ({
    Auth: {
        id: jest.fn(),
    },
}));

describe('PermissionController', () => {
    let controller: PermissionController;
    let service: any;

    beforeEach(async () => {
        service = {
            getList: jest.fn(),
            getSimpleList: jest.fn(),
            getOne: jest.fn(),
            createWithAudit: jest.fn(),
            updateWithAudit: jest.fn(),
            deleteById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PermissionController],
            providers: [
                { provide: PermissionService, useValue: service },
            ],
        }).compile();

        controller = module.get<PermissionController>(PermissionController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getList', () => {
        it('should query list of permissions', async () => {
            const q = { page: 1 };
            service.getList.mockResolvedValue({ data: [] });
            const result = await controller.getList(q);
            expect(service.getList).toHaveBeenCalledWith(q);
            expect(result.data).toEqual([]);
        });
    });

    describe('getSimpleList', () => {
        it('should query simple list of permissions', async () => {
            const q = { search: 'test' };
            service.getSimpleList.mockResolvedValue({ data: [] });
            const result = await controller.getSimpleList(q);
            expect(service.getSimpleList).toHaveBeenCalledWith(q);
            expect(result.data).toEqual([]);
        });
    });

    describe('getOne', () => {
        it('should get a single permission', async () => {
            service.getOne.mockResolvedValue({ id: 1 });
            const result = await controller.getOne(1);
            expect(service.getOne).toHaveBeenCalledWith(1);
            expect(result.id).toBe(1);
        });
    });

    describe('create', () => {
        it('should create permission with audit info', async () => {
            (Auth.id as jest.Mock).mockReturnValue(99);
            const dto = { name: 'P' };
            service.createWithAudit.mockResolvedValue({ id: 1 });

            const result = await controller.create(dto);

            expect(Auth.id).toHaveBeenCalled();
            expect(service.createWithAudit).toHaveBeenCalledWith(dto, 99);
            expect(result.id).toBe(1);
        });
    });

    describe('update', () => {
        it('should update permission with audit info', async () => {
            (Auth.id as jest.Mock).mockReturnValue(99);
            const dto = { name: 'P' };
            service.updateWithAudit.mockResolvedValue({ id: 1 });

            const result = await controller.update(1, dto);

            expect(Auth.id).toHaveBeenCalled();
            expect(service.updateWithAudit).toHaveBeenCalledWith(1, dto, 99);
            expect(result.id).toBe(1);
        });
    });

    describe('delete', () => {
        it('should delete permission', async () => {
            service.deleteById.mockResolvedValue(true);
            const result = await controller.delete(1);
            expect(service.deleteById).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });
    });
});




