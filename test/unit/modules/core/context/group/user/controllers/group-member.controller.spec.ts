import { Test, TestingModule } from '@nestjs/testing';
import { GroupMemberController } from '@/modules/core/context/group/user/controllers/group-member.controller';
import { UserGroupService } from '@/modules/core/context/group/user/services/group.service';
import { AuthService } from '@/common/auth/services';
import { ForbiddenException } from '@nestjs/common';

describe('GroupMemberController', () => {
    let controller: GroupMemberController;
    let service: any;
    let auth: any;

    beforeEach(async () => {
        service = {
            addMember: jest.fn(),
            assignRolesToMember: jest.fn(),
            removeMember: jest.fn(),
            getGroupMembers: jest.fn(),
        };
        auth = { id: jest.fn().mockReturnValue(1) };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [GroupMemberController],
            providers: [
                { provide: UserGroupService, useValue: service },
                { provide: AuthService, useValue: auth },
            ],
        }).compile();

        controller = module.get<GroupMemberController>(GroupMemberController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('addMember', () => {
        it('should throw ForbiddenException if no userId', async () => {
            auth.id.mockReturnValue(null);
            await expect(controller.addMember(10, { user_id: 5, role_ids: [] })).rejects.toThrow(ForbiddenException);
        });

        it('should call service.addMember', async () => {
            await controller.addMember(10, { user_id: 5, role_ids: [1, 2] });
            expect(service.addMember).toHaveBeenCalledWith(10, 5, [1, 2], 1);
        });
    });

    describe('removeMember', () => {
        it('should call service.removeMember', async () => {
            await controller.removeMember(10, 5);
            expect(service.removeMember).toHaveBeenCalledWith(10, 5, 1);
        });
    });
});




