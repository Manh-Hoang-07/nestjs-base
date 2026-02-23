import { Test, TestingModule } from '@nestjs/testing';
import { PermissionRepositoryImpl } from '@/modules/core/iam/permission/infrastructure/repositories/permission.repository.impl';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';

describe('PermissionRepositoryImpl', () => {
    let repo: PermissionRepositoryImpl;
    let prismaService: any;

    beforeEach(async () => {
        prismaService = {
            permission: {} // mock prisma delegate
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PermissionRepositoryImpl,
                { provide: PrismaService, useValue: prismaService },
            ],
        }).compile();

        repo = module.get<PermissionRepositoryImpl>(PermissionRepositoryImpl);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(repo).toBeDefined();
        // default select should be set
        expect((repo as any).defaultSelect).toHaveProperty('id');
    });

    describe('buildWhere', () => {
        it('should return empty object if no filter', () => {
            const filter = {};
            const result = (repo as any).buildWhere(filter);
            expect(result).toEqual({});
        });

        it('should build search filter', () => {
            const filter = { search: 'test' };
            const result = (repo as any).buildWhere(filter);
            expect(result.OR).toEqual([
                { name: { contains: 'test' } },
                { code: { contains: 'test' } },
            ]);
        });

        it('should build status filter', () => {
            const filter = { status: 'active' } as any;
            const result = (repo as any).buildWhere(filter);
            expect(result.status).toBe('active');
        });

        it('should build scope filter', () => {
            const filter = { scope: 'test_scope' } as any;
            const result = (repo as any).buildWhere(filter);
            expect(result.scope).toBe('test_scope');
        });

        it('should build parentId filter, converting to BigInt', () => {
            const filter = { parentId: 1 };
            const result = (repo as any).buildWhere(filter);
            expect(result.parent_id).toBe(1n);
        });

        it('should handle null parentId filter', () => {
            const filter = { parentId: null };
            const result = (repo as any).buildWhere(filter);
            expect(result.parent_id).toBe(null);
        });
    });

    describe('findByCode', () => {
        it('should call findOne with code', async () => {
            jest.spyOn(repo, 'findOne').mockResolvedValue({ id: 1 } as any);
            const result = await repo.findByCode('test_code');

            expect(repo.findOne).toHaveBeenCalledWith({ code: 'test_code' });
            expect(result).toEqual({ id: 1 });
        });
    });
});




