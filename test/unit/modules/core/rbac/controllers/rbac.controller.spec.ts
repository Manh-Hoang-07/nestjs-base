import { Test, TestingModule } from '@nestjs/testing';
import { RbacController } from '@/modules/core/rbac/controllers/rbac.controller';
import { RbacService } from '@/modules/core/rbac/services/rbac.service';
import { RequestContext } from '@/common/shared/utils';
import { Auth } from '@/common/auth/utils';
import { BadRequestException } from '@nestjs/common';

describe('RbacController', () => {
    let controller: RbacController;
    let service: any;

    beforeEach(async () => {
        service = {
            userHasPermissionsInGroup: jest.fn(),
            syncRolesInGroup: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [RbacController],
            providers: [
                { provide: RbacService, useValue: service },
            ],
        }).compile();

        controller = module.get<RbacController>(RbacController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('syncRoles', () => {
        it('should throw BadRequestException if no groupId', async () => {
            jest.spyOn(RequestContext, 'get').mockReturnValue(null);
            await expect(controller.syncRoles(1, { role_ids: [1] })).rejects.toThrow(BadRequestException);
        });

        it('should call syncRolesInGroup with correct params', async () => {
            jest.spyOn(RequestContext, 'get').mockReturnValue(123); // Mock groupId
            jest.spyOn(Auth, 'id').mockReturnValue(1);
            service.userHasPermissionsInGroup.mockResolvedValue(true); // isSystemAdmin

            await controller.syncRoles(5, { role_ids: [10, 20] });

            expect(service.syncRolesInGroup).toHaveBeenCalledWith(5, 123, [10, 20], true);
        });
    });
});




