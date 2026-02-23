import { Test, TestingModule } from '@nestjs/testing';
import { PostCategoryService } from '@/modules/post/post-category/public/services/post-category.service';
import { POST_CATEGORY_REPOSITORY } from '@/modules/post/post-category/domain/post-category.repository';
import { BaseService } from '@/common/core/services';

describe('PostCategoryService (Public)', () => {
    let service: PostCategoryService;
    let categoryRepo: any;
    let baseGetListSpy: jest.SpyInstance;

    beforeEach(async () => {
        categoryRepo = {
            findBySlug: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostCategoryService,
                { provide: POST_CATEGORY_REPOSITORY, useValue: categoryRepo },
            ],
        }).compile();

        service = module.get<PostCategoryService>(PostCategoryService);

        baseGetListSpy = jest.spyOn(BaseService.prototype as any, 'getList').mockResolvedValue('list_result' as any);
        jest.spyOn(service as any, 'transform').mockImplementation((v: any) => ({ ...v, transformed: true }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getList', () => {
        it('should build filter with active status, parentId and search', async () => {
            const query = { page: 1, limit: 20, parentId: 5, search: 'cat', sort: 'name:ASC' };

            const result = await service.getList(query as any);

            expect(baseGetListSpy).toHaveBeenCalledWith({
                page: 1,
                limit: 20,
                sort: 'name:ASC',
                filter: {
                    status: 'active',
                    parentId: 5,
                    search: 'cat',
                },
            });
            expect(result).toBe('list_result');
        });

        it('should use default sort when not provided', async () => {
            await service.getList({ page: 1, limit: 10 } as any);

            expect(baseGetListSpy).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                sort: 'sort_order:ASC',
                filter: {
                    status: 'active',
                },
            });
        });
    });

    describe('findBySlug', () => {
        it('should return null when category not found', async () => {
            categoryRepo.findBySlug.mockResolvedValue(null);

            const result = await service.findBySlug('not-found');
            expect(result).toBeNull();
        });

        it('should return null when category is not active', async () => {
            categoryRepo.findBySlug.mockResolvedValue({ id: 1, status: 'inactive' });

            const result = await service.findBySlug('inactive-category');
            expect(result).toBeNull();
        });

        it('should transform and return active category', async () => {
            const category = { id: 1, status: 'active' };
            categoryRepo.findBySlug.mockResolvedValue(category);

            const result = await service.findBySlug('active-category');

            expect(categoryRepo.findBySlug).toHaveBeenCalledWith('active-category');
            expect(result).toEqual({ ...category, transformed: true });
        });
    });
});


