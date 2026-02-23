import { Test, TestingModule } from '@nestjs/testing';
import { PostCategoryService } from '@/modules/post/post-category/admin/services/post-category.service';
import { POST_CATEGORY_REPOSITORY } from '@/modules/post/post-category/domain/post-category.repository';

describe('PostCategoryService', () => {
    let service: PostCategoryService;
    let categoryRepo: any;

    beforeEach(async () => {
        categoryRepo = {
            findById: jest.fn(),
            findFirstRaw: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostCategoryService,
                {
                    provide: POST_CATEGORY_REPOSITORY,
                    useValue: categoryRepo,
                },
            ],
        }).compile();

        service = module.get<PostCategoryService>(PostCategoryService);

        jest.spyOn(service as any, 'getList').mockResolvedValue('list_result');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getSimpleList', () => {
        it('should call getList with default sort and limit 1000', async () => {
            const query = { search: 'cat' };

            const result = await service.getSimpleList(query as any);

            expect((service as any).getList).toHaveBeenCalledWith({
                ...query,
                limit: 1000,
                sort: 'sort_order:ASC',
            });
            expect(result).toBe('list_result');
        });

        it('should respect custom sort but still force limit 1000', async () => {
            const query = { search: 'cat', sort: 'name:DESC', limit: 20 };

            await service.getSimpleList(query as any);

            expect((service as any).getList).toHaveBeenCalledWith({
                ...query,
                limit: 1000,
                sort: 'name:DESC',
            });
        });
    });

    describe('beforeCreate', () => {
        it('should call ensureSlug and convert parent_id to bigint', async () => {
            const data = { name: 'Tech', parent_id: '5' };
            const ensureSlugSpy = jest
                .spyOn(service as any, 'ensureSlug')
                .mockResolvedValue(undefined);

            const result = await (service as any).beforeCreate(data);

            expect(ensureSlugSpy).toHaveBeenCalledTimes(1);
            const [payloadArg] = ensureSlugSpy.mock.calls[0];
            expect((payloadArg as any).name).toBe('Tech');
            expect(typeof result.parent_id).toBe('bigint');
            expect(result.parent_id?.toString()).toBe('5');
        });

        it('should set parent_id to null when invalid', async () => {
            const data = { name: 'Tech', parent_id: 'invalid' };
            jest.spyOn(service as any, 'ensureSlug').mockResolvedValue(undefined);

            const result = await (service as any).beforeCreate(data);

            expect(result.parent_id).toBeNull();
        });
    });

    describe('beforeUpdate', () => {
        it('should load current category and call ensureSlug with current slug', async () => {
            const current = { id: 1, slug: 'old-slug' };
            categoryRepo.findById.mockResolvedValue(current);

            const data = { name: 'New', parent_id: '2' };
            const ensureSlugSpy = jest
                .spyOn(service as any, 'ensureSlug')
                .mockResolvedValue(undefined);

            const result = await (service as any).beforeUpdate(1, data);

            expect(categoryRepo.findById).toHaveBeenCalledWith(1);
            expect(ensureSlugSpy).toHaveBeenCalledTimes(1);

            const [payloadArg, idArg, currentSlugArg] = ensureSlugSpy.mock.calls[0];
            expect((payloadArg as any).name).toBe('New');
            expect(idArg).toBe(1);
            expect(currentSlugArg).toBe('old-slug');
            expect(typeof result.parent_id).toBe('bigint');
            expect(result.parent_id?.toString()).toBe('2');
        });
    });

    describe('transform', () => {
        it('should keep only id, name, slug for parent and children', () => {
            const category: any = {
                id: 1,
                name: 'Parent',
                slug: 'parent',
                parent: {
                    id: 2,
                    name: 'Root',
                    slug: 'root',
                    extra: 'ignored',
                },
                children: [
                    { id: 3, name: 'Child1', slug: 'child-1', extra: 'x' },
                    { id: 4, name: 'Child2', slug: 'child-2', extra: 'y' },
                ],
            };

            const result = (service as any).transform(category);

            expect(result.parent).toEqual({ id: 2, name: 'Root', slug: 'root' });
            expect(result.children).toEqual([
                { id: 3, name: 'Child1', slug: 'child-1' },
                { id: 4, name: 'Child2', slug: 'child-2' },
            ]);
        });

        it('should return entity as is when no parent and children', () => {
            const category: any = { id: 1, name: 'Single', slug: 'single' };
            const result = (service as any).transform(category);
            expect(result).toEqual(category);
        });
    });
});

