import { Test, TestingModule } from '@nestjs/testing';
import { UserGroupController } from '@/modules/core/context/group/user/controllers/group.controller';
import { UserGroupService } from '@/modules/core/context/group/user/services/group.service';
import { AuthService } from '@/common/auth/services';

describe('UserGroupController', () => {
    let controller: UserGroupController;
    let service: any;
    let auth: any;

    beforeEach(async () => {
        service = { getUserGroups: jest.fn() };
        auth = { id: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserGroupController],
            providers: [
                { provide: UserGroupService, useValue: service },
                { provide: AuthService, useValue: auth },
            ],
        }).compile();

        controller = module.get<UserGroupController>(UserGroupController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getMyGroups', () => {
        it('should return groups from service', async () => {
            auth.id.mockReturnValue(1);
            service.getUserGroups.mockResolvedValue([{ id: 10, name: 'Group 1' }]);

            const result = await controller.getMyGroups();
            expect(result).toBeDefined();
            if (result && result.length > 0) {
                expect((result[0] as any).name).toBe('Group 1');
            }
        });

        it('should return empty if no userId', async () => {
            auth.id.mockReturnValue(null);
            expect(await controller.getMyGroups()).toEqual([]);
        });
    });
});




