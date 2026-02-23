import { Test, TestingModule } from '@nestjs/testing';
import { RbacService } from '@/modules/core/rbac/services/rbac.service';
import { USER_GROUP_REPOSITORY } from '@/modules/core/rbac/user-group/domain/user-group.repository';
import { USER_ROLE_ASSIGNMENT_REPOSITORY } from '@/modules/core/rbac/user-role-assignment/domain/user-role-assignment.repository';
import { ROLE_HAS_PERMISSION_REPOSITORY } from '@/modules/core/rbac/role-has-permission/domain/role-has-permission.repository';
import { ROLE_CONTEXT_REPOSITORY } from '@/modules/core/rbac/role-context/domain/role-context.repository';
import { GROUP_REPOSITORY } from '@/modules/core/context/group/domain/group.repository';
import { USER_REPOSITORY } from '@/modules/core/iam/user/domain/user.repository';
import { ROLE_REPOSITORY } from '@/modules/core/iam/role/domain/role.repository';
import { RbacCacheService } from '@/modules/core/rbac/services/rbac-cache.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RbacService', () => {
    let service: RbacService;
    let userGroupRepo: any;
    let assignmentRepo: any;
    let roleHasPermRepo: any;
    let roleContextRepo: any;
    let groupRepo: any;
    let userRepo: any;
    let roleRepo: any;
    let rbacCache: any;

    beforeEach(async () => {
        userGroupRepo = { findUnique: jest.fn() };
        assignmentRepo = { findManyRaw: jest.fn(), findUnique: jest.fn(), create: jest.fn(), createMany: jest.fn(), deleteMany: jest.fn() };
        roleHasPermRepo = { findMany: jest.fn() };
        roleContextRepo = { findFirst: jest.fn(), findMany: jest.fn() };
        groupRepo = { findFirstRaw: jest.fn(), findById: jest.fn() };
        userRepo = { findById: jest.fn() };
        roleRepo = { findManyRaw: jest.fn() };
        rbacCache = {
            getUserPermissionsInGroup: jest.fn(),
            setUserPermissionsInGroup: jest.fn(),
            clearUserPermissionsInGroup: jest.fn(),
            getSystemPermissions: jest.fn(),
            setSystemPermissions: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RbacService,
                { provide: USER_GROUP_REPOSITORY, useValue: userGroupRepo },
                { provide: USER_ROLE_ASSIGNMENT_REPOSITORY, useValue: assignmentRepo },
                { provide: ROLE_HAS_PERMISSION_REPOSITORY, useValue: roleHasPermRepo },
                { provide: ROLE_CONTEXT_REPOSITORY, useValue: roleContextRepo },
                { provide: GROUP_REPOSITORY, useValue: groupRepo },
                { provide: USER_REPOSITORY, useValue: userRepo },
                { provide: ROLE_REPOSITORY, useValue: roleRepo },
                { provide: RbacCacheService, useValue: rbacCache },
            ],
        }).compile();

        service = module.get<RbacService>(RbacService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('userHasPermissionsInGroup', () => {
        it('should return false if user not in group', async () => {
            userGroupRepo.findUnique.mockResolvedValue(null);
            const result = await service.userHasPermissionsInGroup(1, 10, ['p1']);
            expect(result).toBe(false);
        });

        it('should use cache if available', async () => {
            userGroupRepo.findUnique.mockResolvedValue({ id: 1 });
            rbacCache.getUserPermissionsInGroup.mockResolvedValue(new Set(['p1']));

            const result = await service.userHasPermissionsInGroup(1, 10, ['p1']);
            expect(result).toBe(true);
            expect(assignmentRepo.findManyRaw).not.toHaveBeenCalled();
        });

        it('should query DB and update cache if not in cache', async () => {
            userGroupRepo.findUnique.mockResolvedValue({ id: 1 });
            rbacCache.getUserPermissionsInGroup.mockResolvedValue(null);
            assignmentRepo.findManyRaw.mockResolvedValue([{ role_id: 5 }]);
            roleHasPermRepo.findMany.mockResolvedValue([
                { permission: { code: 'p1' } }
            ]);

            const result = await service.userHasPermissionsInGroup(1, 10, ['p1']);
            expect(result).toBe(true);
            expect(rbacCache.setUserPermissionsInGroup).toHaveBeenCalled();
        });
    });

    describe('assignRoleToUser', () => {
        it('should throw BadRequestException if user not in group', async () => {
            userGroupRepo.findUnique.mockResolvedValue(null);
            await expect(service.assignRoleToUser(1, 5, 10)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if role not allowed in context', async () => {
            userGroupRepo.findUnique.mockResolvedValue({ id: 1 });
            groupRepo.findById.mockResolvedValue({ id: 10, context_id: 1 });
            roleContextRepo.findFirst.mockResolvedValue(null);

            await expect(service.assignRoleToUser(1, 5, 10)).rejects.toThrow(BadRequestException);
        });

        it('should create assignment if valid', async () => {
            userGroupRepo.findUnique.mockResolvedValue({ id: 1 });
            groupRepo.findById.mockResolvedValue({ id: 10, context_id: 1 });
            roleContextRepo.findFirst.mockResolvedValue({ id: 1 });
            assignmentRepo.findUnique.mockResolvedValue(null);

            await service.assignRoleToUser(1, 5, 10);
            expect(assignmentRepo.create).toHaveBeenCalled();
            expect(rbacCache.clearUserPermissionsInGroup).toHaveBeenCalledWith(1, 10);
        });
    });
    describe('syncRolesInGroup', () => {
        it('should throw NotFoundException if user or group not found', async () => {
            userRepo.findById.mockResolvedValue(null);
            await expect(service.syncRolesInGroup(1, 10, [5])).rejects.toThrow(NotFoundException);
        });

        it('should sync roles correctly', async () => {
            userRepo.findById.mockResolvedValue({ id: 1 });
            groupRepo.findById.mockResolvedValue({ id: 10, context_id: 1 });
            userGroupRepo.findUnique.mockResolvedValue({ id: 1 });
            roleRepo.findManyRaw.mockResolvedValue([{ id: 5 }]);
            roleContextRepo.findFirst.mockResolvedValue({ id: 1 });
            roleContextRepo.findMany.mockResolvedValue([{ role_id: BigInt(5) }]);
            assignmentRepo.findUnique.mockResolvedValue(null);

            await service.syncRolesInGroup(1, 10, [5]);

            expect(assignmentRepo.deleteMany).toHaveBeenCalled();
            expect(assignmentRepo.createMany).toHaveBeenCalled();
            expect(rbacCache.clearUserPermissionsInGroup).toHaveBeenCalledWith(1, 10);
        });
    });

    describe('checkSystemPermissions', () => {
        it('should return false if system group not found', async () => {
            rbacCache.getSystemPermissions.mockResolvedValue(null);
            groupRepo.findFirstRaw.mockResolvedValue(null);
            const result = await (service as any).checkSystemPermissions(1, ['p1']);
            expect(result).toBe(false);
        });

        it('should return true if user has p1 in system group', async () => {
            rbacCache.getSystemPermissions.mockResolvedValue(null);
            groupRepo.findFirstRaw.mockResolvedValue({ id: 1 });
            userGroupRepo.findUnique.mockResolvedValue({ id: 1 });
            assignmentRepo.findManyRaw.mockResolvedValue([{ role_id: 5 }]);
            roleHasPermRepo.findMany.mockResolvedValue([{ permission: { code: 'p1' } }]);

            const result = await (service as any).checkSystemPermissions(1, ['p1']);
            expect(result).toBe(true);
        });
    });
});




