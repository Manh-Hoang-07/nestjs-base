import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from '@/modules/core/iam/permission/admin/services/permission.service';
import { PERMISSION_REPOSITORY } from '@/modules/core/iam/permission/domain/permission.repository';
import { RbacCacheService } from '@/modules/core/rbac/services/rbac-cache.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PermissionService', () => {
    let service: PermissionService;
    let repo: any;
    let rbacCache: any;

    beforeEach(async () => {
        repo = {
            findByCode: jest.fn(),
            findById: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        rbacCache = {
            bumpVersion: jest.fn().mockResolvedValue(undefined),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PermissionService,
                { provide: PERMISSION_REPOSITORY, useValue: repo },
                { provide: RbacCacheService, useValue: rbacCache },
            ],
        }).compile();

        service = module.get<PermissionService>(PermissionService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createWithAudit', () => {
        it('should add created/updated user id if createdBy is provided', async () => {
            // Mock BaseService.create behavior simply
            service.create = jest.fn().mockResolvedValue({ id: 1n });

            const payload = { name: 't', code: 'c' };
            const userId = 99;

            await service.createWithAudit(payload, userId);

            expect(payload).toHaveProperty('created_user_id', userId);
            expect(payload).toHaveProperty('updated_user_id', userId);
            expect(service.create).toHaveBeenCalledWith(payload);
        });

        it('should call create normally if createdBy not provided', async () => {
            service.create = jest.fn().mockResolvedValue({ id: 1n });

            const payload = { name: 't', code: 'c' };
            await service.createWithAudit(payload);

            expect(payload).not.toHaveProperty('created_user_id');
            expect(service.create).toHaveBeenCalledWith(payload);
        });
    });

    describe('updateWithAudit', () => {
        it('should add updated user id if updatedBy is provided', async () => {
            service.update = jest.fn().mockResolvedValue({ id: 1n });

            const payload = { name: 't' };
            const userId = 99;

            await service.updateWithAudit(1, payload, userId);

            expect(payload).toHaveProperty('updated_user_id', userId);
            expect(service.update).toHaveBeenCalledWith(1, payload);
        });
    });

    describe('deleteById', () => {
        it('should call base delete', async () => {
            service.delete = jest.fn().mockResolvedValue(true);
            await service.deleteById(1);
            expect(service.delete).toHaveBeenCalledWith(1);
        });
    });

    describe('beforeCreate', () => {
        it('should throw BadRequestException if permission code exists', async () => {
            repo.findByCode.mockResolvedValue({ id: 1n });

            await expect((service as any).beforeCreate({ code: 'admin' }))
                .rejects.toThrow(BadRequestException);
        });

        it('should return prepared payload if code is unique', async () => {
            repo.findByCode.mockResolvedValue(null);

            const data = { code: 'admin', parent_id: 1, created_user_id: 2 };
            const result = await (service as any).beforeCreate(data);

            expect(result.parent_id).toBe(1n);
            expect(result.created_user_id).toBe(2n);
        });
    });

    describe('beforeUpdate', () => {
        it('should throw NotFoundException if permission not found', async () => {
            repo.findById.mockResolvedValue(null);
            await expect((service as any).beforeUpdate(1n, {})).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if new code already exists', async () => {
            repo.findById.mockResolvedValue({ code: 'old' });
            repo.findByCode.mockResolvedValue({ id: 2n }); // another permission with same code

            await expect((service as any).beforeUpdate(1n, { code: 'new' }))
                .rejects.toThrow(BadRequestException);
        });

        it('should return prepared payload if code unchanged', async () => {
            repo.findById.mockResolvedValue({ code: 'old' });
            const data = { code: 'old', updated_user_id: 2 };

            const result = await (service as any).beforeUpdate(1n, data);

            expect(result.updated_user_id).toBe(2n);
            expect(repo.findByCode).not.toHaveBeenCalled();
        });

        it('should return prepared payload if code new and unique', async () => {
            repo.findById.mockResolvedValue({ code: 'old' });
            repo.findByCode.mockResolvedValue(null);

            const data = { code: 'new' };
            const result = await (service as any).beforeUpdate(1n, data);

            expect(result.code).toBe('new');
        });
    });

    describe('afterUpdate / afterDelete', () => {
        it('should bump rbac version after update', async () => {
            await (service as any).afterUpdate();
            expect(rbacCache.bumpVersion).toHaveBeenCalled();
        });

        it('should bump rbac version after delete', async () => {
            await (service as any).afterDelete();
            expect(rbacCache.bumpVersion).toHaveBeenCalled();
        });

        it('should swallow bump version errors', async () => {
            rbacCache.bumpVersion.mockRejectedValue(new Error('Redis Error'));
            await expect((service as any).afterUpdate()).resolves.not.toThrow();
        });
    });

    describe('beforeDelete', () => {
        it('should throw BadRequestException if permission has children', async () => {
            repo.count.mockResolvedValue(1); // 1 child

            await expect((service as any).beforeDelete(1n))
                .rejects.toThrow(BadRequestException);
            expect(repo.count).toHaveBeenCalledWith({ parent_id: 1n, deleted_at: null });
        });

        it('should return true if no children', async () => {
            repo.count.mockResolvedValue(0);

            const result = await (service as any).beforeDelete(1n);
            expect(result).toBe(true);
        });
    });

    describe('transform', () => {
        it('should transform normally and filter parent/children data', () => {
            const dbResult = {
                id: 1n,
                code: 'view',
                name: 'View',
                parent: { id: 2n, code: 'group_code', name: 'Group', extra_info: 'hidden', status: 'active' },
                children: [
                    { id: 3n, code: 'child', name: 'Child', extra_info: 'hidden', status: 'active' }
                ]
            };

            const result = (service as any).transform(dbResult);

            expect(result.id).toBe(1);
            expect(result.parent).toEqual({ id: 2, code: 'group_code', name: 'Group', status: 'active' });
            expect(result.parent.extra_info).toBeUndefined();
            expect(result.children[0]).toEqual({ id: 3, code: 'child', name: 'Child', status: 'active' });
            expect(result.children[0].extra_info).toBeUndefined();
        });

        it('should handle null transformation', () => {
            expect((service as any).transform(null)).toBeNull();
        });
    });
});




