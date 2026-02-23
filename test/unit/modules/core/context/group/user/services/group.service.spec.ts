import { Test, TestingModule } from '@nestjs/testing';
import { UserGroupService } from '@/modules/core/context/group/user/services/group.service';
import { GROUP_REPOSITORY } from '@/modules/core/context/group/domain/group.repository';
import { CONTEXT_REPOSITORY } from '@/modules/core/context/context/domain/context.repository';
import { USER_GROUP_REPOSITORY } from '@/modules/core/rbac/user-group/domain/user-group.repository';
import { USER_ROLE_ASSIGNMENT_REPOSITORY } from '@/modules/core/rbac/user-role-assignment/domain/user-role-assignment.repository';
import { ROLE_REPOSITORY } from '@/modules/core/iam/role/domain/role.repository';
import { USER_REPOSITORY } from '@/modules/core/iam/user/domain/user.repository';
import { RbacService } from '@/modules/core/rbac/services/rbac.service';
import { RbacCacheService } from '@/modules/core/rbac/services/rbac-cache.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('UserGroupService', () => {
    let service: UserGroupService;
    let groupRepo: any;
    let userGroupRepo: any;
    let rbacService: any;
    let rbacCache: any;

    beforeEach(async () => {
        groupRepo = {
            findById: jest.fn(),
            findFirstRaw: jest.fn(),
        };
        userGroupRepo = {
            findUnique: jest.fn(),
            create: jest.fn(),
            deleteMany: jest.fn(),
            findManyRaw: jest.fn(),
        };
        rbacService = {
            userHasPermissionsInGroup: jest.fn(),
            assignRoleToUser: jest.fn(),
        };
        rbacCache = {
            clearUserPermissionsInGroup: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserGroupService,
                { provide: GROUP_REPOSITORY, useValue: groupRepo },
                { provide: CONTEXT_REPOSITORY, useValue: {} },
                { provide: USER_GROUP_REPOSITORY, useValue: userGroupRepo },
                { provide: USER_ROLE_ASSIGNMENT_REPOSITORY, useValue: { deleteMany: jest.fn(), findManyRaw: jest.fn() } },
                { provide: ROLE_REPOSITORY, useValue: { findManyRaw: jest.fn() } },
                { provide: USER_REPOSITORY, useValue: { findById: jest.fn() } },
                { provide: RbacService, useValue: rbacService },
                { provide: RbacCacheService, useValue: rbacCache },
            ],
        }).compile();

        service = module.get<UserGroupService>(UserGroupService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('isOwner', () => {
        it('should return true if user is owner', async () => {
            groupRepo.findById.mockResolvedValue({ owner_id: BigInt(5) });
            expect(await service.isOwner(1, 5)).toBe(true);
        });

        it('should return false if not owner', async () => {
            groupRepo.findById.mockResolvedValue({ owner_id: BigInt(10) });
            expect(await service.isOwner(1, 5)).toBe(false);
        });
    });

    describe('addMember', () => {
        it('should throw ForbiddenException if requester cannot manage group', async () => {
            groupRepo.findById.mockResolvedValue({ owner_id: BigInt(10) });
            rbacService.userHasPermissionsInGroup.mockResolvedValue(false);

            await expect(service.addMember(1, 5, [], 1)).rejects.toThrow(ForbiddenException);
        });

        it('should call userGroupRepo.create if member not in group', async () => {
            groupRepo.findById.mockResolvedValue({ owner_id: BigInt(1) }); // requester is owner
            userGroupRepo.findUnique.mockResolvedValue(null);
            // userRepo mock needed
            (service as any).userRepo.findById.mockResolvedValue({ id: 5 });

            await service.addMember(1, 5, [], 1);
            expect(userGroupRepo.create).toHaveBeenCalled();
        });
    });

    describe('removeMember', () => {
        it('should throw BadRequestException if trying to remove owner', async () => {
            groupRepo.findById.mockResolvedValue({ owner_id: BigInt(5) });
            // requester is owner
            await expect(service.removeMember(1, 5, 5)).rejects.toThrow(BadRequestException);
        });
    });
});




