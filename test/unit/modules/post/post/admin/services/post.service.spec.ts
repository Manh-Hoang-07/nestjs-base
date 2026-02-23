import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '@/modules/post/post/admin/services/post.service';
import { POST_REPOSITORY } from '@/modules/post/post/domain/post.repository';
import { BadRequestException } from '@nestjs/common';
import * as utils from '@/common/shared/utils';

jest.mock('@/common/shared/utils', () => ({
    verifyGroupOwnership: jest.fn(),
    RequestContext: {
        current: jest.fn().mockReturnValue({ group_id: 1, user_id: 1 })
    }
}));

describe('PostService', () => {
    let service: PostService;
    let postRepo: any;

    beforeEach(async () => {
        postRepo = {
            findById: jest.fn(),
            syncRelations: jest.fn(),
            update: jest.fn(),
            getViewStats: jest.fn(),
            getStatisticsOverview: jest.fn(),
            findBySlug: jest.fn(), // for BaseContentService check
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostService,
                { provide: POST_REPOSITORY, useValue: postRepo },
            ],
        }).compile();

        service = module.get<PostService>(PostService);

        // Mocking parent class method that we don't test
        jest.spyOn(service as any, 'update').mockResolvedValue(true);
        jest.spyOn(service as any, 'getList').mockResolvedValue(true);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getSimpleList', () => {
        it('should call getList with default pagination', async () => {
            await service.getSimpleList({ search: 'test' });
            expect((service as any).getList).toHaveBeenCalledWith({
                page: 1,
                limit: 1000,
                search: 'test'
            });
        });
    });

    describe('beforeCreate', () => {
        it('should modify payload and store relations temp', async () => {
            const data = { title: 'Test', primary_postcategory_id: 123, tag_ids: [1, 2], group_id: 1n };
            jest.spyOn(service as any, 'ensureSlug').mockResolvedValue('test');
            // Mock parent beforeCreate to return basic object structure
            jest.spyOn(Object.getPrototypeOf(PostService.prototype), 'beforeCreate').mockResolvedValue({ ...data });

            const result = await (service as any).beforeCreate(data);

            expect(result.primary_postcategory_id).toBe(123n);
            expect(result.group_id).toBe(1n);
            expect(result.tag_ids).toBeUndefined(); // Should be removed
            expect((service as any)._temp_tagIds).toEqual([1, 2]);
        });
    });

    describe('afterCreate', () => {
        it('should sync relations', async () => {
            const post = { id: 1 };
            (service as any)._temp_tagIds = [1, 2];
            (service as any)._temp_categoryIds = [3];

            await (service as any).afterCreate(post as any, {});

            expect(postRepo.syncRelations).toHaveBeenCalledWith(1, [1, 2], [3]);
        });

        it('should sync relations with empty arrays if not present', async () => {
            const post = { id: 1 };
            (service as any)._temp_tagIds = null;
            (service as any)._temp_categoryIds = null;

            await (service as any).afterCreate(post as any, {});

            expect(postRepo.syncRelations).not.toHaveBeenCalled();
        });
    });

    describe('beforeUpdate', () => {
        it('should throw BadRequestException if post is not found', async () => {
            postRepo.findById.mockResolvedValue(null);
            await expect((service as any).beforeUpdate(1, {})).rejects.toThrow(BadRequestException);
        });

        it('should return payload if validation passes', async () => {
            postRepo.findById.mockResolvedValue({ id: 1, group_id: 1 });
            jest.spyOn(service as any, 'ensureSlug').mockResolvedValue('test');

            const result = await (service as any).beforeUpdate(1, { title: 'T2', tag_ids: [4] });

            expect(utils.verifyGroupOwnership).toHaveBeenCalled();
            expect(result.tag_ids).toBeUndefined();
            expect((service as any)._temp_tagIds).toEqual([4]);
        });
    });

    describe('afterUpdate', () => {
        it('should sync relations', async () => {
            const post = { id: 1 };
            (service as any)._temp_tagIds = [1];
            (service as any)._temp_categoryIds = [2];

            await (service as any).afterUpdate(post as any, {});

            expect(postRepo.syncRelations).toHaveBeenCalledWith(1, [1], [2]);
        });
    });

    describe('delete', () => {
        it('should return false if post not found', async () => {
            postRepo.findById.mockResolvedValue(null);
            const result = await service.delete(1);
            expect(result).toBe(false);
        });

        it('should verify ownership and soft delete', async () => {
            postRepo.findById.mockResolvedValue({ id: 1, group_id: 1 });

            const result = await service.delete(1);

            expect(utils.verifyGroupOwnership).toHaveBeenCalled();
            expect(service.update).toHaveBeenCalledWith(1, expect.any(Object)); // deleted_at update
            expect(result).toBe(true);
        });
    });
});
