import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from '@/modules/core/iam/role/admin/services/role.service';
import { ROLE_REPOSITORY } from '@/modules/core/iam/role/domain/role.repository';
import { PERMISSION_REPOSITORY } from '@/modules/core/iam/permission/domain/permission.repository';
import { USER_ROLE_ASSIGNMENT_REPOSITORY } from '@/modules/core/rbac/user-role-assignment/domain/user-role-assignment.repository';
import { RbacCacheService } from '@/modules/core/rbac/services/rbac-cache.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RequestContext } from '@/common/shared/utils';

describe('RoleService', () => {
    let service: RoleService;
    let roleRepo: any;
    let permissionRepo: any;
    let assignmentRepo: any;
    let rbacCache: any;

    beforeEach(async () => {
        roleRepo = {
            findByCode: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            syncContexts: jest.fn(),
            syncPermissions: jest.fn(),
            toPrimaryKey: jest.fn((id) => id),
        };

        permissionRepo = {};
        assignmentRepo = { count: jest.fn() };
        rbacCache = { bumpVersion: jest.fn().mockResolvedValue(undefined) };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoleService,
                { provide: ROLE_REPOSITORY, useValue: roleRepo },
                { provide: PERMISSION_REPOSITORY, useValue: permissionRepo },
                { provide: USER_ROLE_ASSIGNMENT_REPOSITORY, useValue: assignmentRepo },
                { provide: RbacCacheService, useValue: rbacCache },
            ],
        }).compile();

        service = module.get<RoleService>(RoleService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('beforeCreate', () => {
        it('should throw BadRequestException if code exists', async () => {
            roleRepo.findByCode.mockResolvedValue({ id: 1 });
            await expect((service as any).beforeCreate({ code: 'ADMIN' })).rejects.toThrow(BadRequestException);
        });

        it('should store context_ids in pendingContextIds and remove from payload', async () => {
            roleRepo.findByCode.mockResolvedValue(null);
            const payload = await (service as any).beforeCreate({ code: 'NEW', context_ids: [1, 2] });
            expect((service as any).pendingContextIds).toEqual([1, 2]);
            expect(payload.context_ids).toBeUndefined();
        });
    });

    describe('afterCreate', () => {
        it('should sync contexts if pendingContextIds exists', async () => {
            (service as any).pendingContextIds = [1, 2];
            await (service as any).afterCreate({ id: BigInt(5) });
            expect(roleRepo.syncContexts).toHaveBeenCalledWith(BigInt(5), [1, 2]);
            expect((service as any).pendingContextIds).toBeNull();
        });
    });

    describe('beforeDelete', () => {
        it('should throw BadRequestException if role has children', async () => {
            roleRepo.count.mockResolvedValue(1);
            await expect((service as any).beforeDelete(1)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if role is assigned to users', async () => {
            roleRepo.count.mockResolvedValue(0);
            assignmentRepo.count.mockResolvedValue(1);
            await expect((service as any).beforeDelete(1)).rejects.toThrow(BadRequestException);
        });
    });

    describe('assignPermissions', () => {
        it('should sync permissions and bump cache version', async () => {
            const mockRole = { id: BigInt(1) };
            // getOne calls repository.findById
            roleRepo.findById.mockResolvedValue(mockRole);

            await service.assignPermissions(1, [10, 20]);

            expect(roleRepo.syncPermissions).toHaveBeenCalledWith(1, [10, 20]);
            expect(rbacCache.bumpVersion).toHaveBeenCalled();
        });
    });

    describe('transform', () => {
        it('should correctly format parent and children', () => {
            const mockRole = {
                id: BigInt(1),
                parent: { id: BigInt(2), code: 'P1', name: 'Parent', status: 'active', other: 'omit' },
                children: [{ id: BigInt(3), code: 'C1', name: 'Child', status: 'active', other: 'omit' }]
            };
            const result = (service as any).transform(mockRole);
            expect(result.parent).toEqual({ id: 2, code: 'P1', name: 'Parent', status: 'active' });
            expect(result.children[0]).toEqual({ id: 3, code: 'C1', name: 'Child', status: 'active' });
        });
    });
});




