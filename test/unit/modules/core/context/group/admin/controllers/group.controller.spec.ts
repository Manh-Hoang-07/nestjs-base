import { Test, TestingModule } from '@nestjs/testing';
import { AdminGroupController } from '@/modules/core/context/group/admin/controllers/group.controller';
import { AdminGroupService } from '@/modules/core/context/group/admin/services/group.service';
import { AuthService } from '@/common/auth/services';
import { ForbiddenException } from '@nestjs/common';

describe('AdminGroupController', () => {
    let controller: AdminGroupController;
    let service: any;
    let auth: any;

    beforeEach(async () => {
        service = {
            createGroup: jest.fn(),
            getList: jest.fn(),
            findById: jest.fn(),
            isSystemAdmin: jest.fn(),
            updateGroup: jest.fn(),
            deleteGroup: jest.fn(),
        };
        auth = { id: jest.fn().mockReturnValue(1) };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AdminGroupController],
            providers: [
                { provide: AdminGroupService, useValue: service },
                { provide: AuthService, useValue: auth },
            ],
        }).compile();

        controller = module.get<AdminGroupController>(AdminGroupController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createGroup', () => {
        it('should throw ForbiddenException if no userId', async () => {
            auth.id.mockReturnValue(null);
            await expect(controller.createGroup({ type: 'T', code: 'C', name: 'N', context_id: 1 })).rejects.toThrow(ForbiddenException);
        });

        it('should call service.createGroup with userId as owner', async () => {
            const body = { type: 'T', code: 'C', name: 'N', context_id: 1 };
            await controller.createGroup(body);
            expect(service.createGroup).toHaveBeenCalledWith(expect.objectContaining({ owner_id: 1 }), 1);
        });
    });

    describe('updateGroup', () => {
        it('should throw ForbiddenException if not system admin', async () => {
            service.isSystemAdmin.mockResolvedValue(false);
            await expect(controller.updateGroup(10, { name: 'New' })).rejects.toThrow(ForbiddenException);
        });

        it('should call updateGroup if system admin', async () => {
            service.isSystemAdmin.mockResolvedValue(true);
            await controller.updateGroup(10, { name: 'New' });
            expect(service.updateGroup).toHaveBeenCalledWith(10, { name: 'New' });
        });
    });
});




