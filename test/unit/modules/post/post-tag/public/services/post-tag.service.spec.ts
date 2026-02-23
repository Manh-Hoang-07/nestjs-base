import { Test, TestingModule } from '@nestjs/testing';
import { PostTagService } from '@/modules/post/post-tag/public/services/post-tag.service';
import { POST_TAG_REPOSITORY } from '@/modules/post/post-tag/domain/post-tag.repository';
import { BaseService } from '@/common/core/services';

describe('PostTagService (Public)', () => {
    let service: PostTagService;
    let tagRepo: any;
    let baseGetListSpy: jest.SpyInstance;

    beforeEach(async () => {
        tagRepo = {
            findBySlug: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostTagService,
                { provide: POST_TAG_REPOSITORY, useValue: tagRepo },
            ],
        }).compile();

        service = module.get<PostTagService>(PostTagService);

        // Spy on BaseService.getList (called via super.getList) instead of overriding service.getList
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
        it('should build filter with active status and optional search', async () => {
            const query = { page: 2, limit: 5, sort: 'name:ASC', search: 'tag' };

            const result = await service.getList(query as any);

            expect(baseGetListSpy).toHaveBeenCalledWith({
                page: 2,
                limit: 5,
                sort: 'name:ASC',
                filter: {
                    status: 'active',
                    search: 'tag',
                },
            });
            expect(result).toBe('list_result');
        });

        it('should use default sort when not provided', async () => {
            await service.getList({ page: 1, limit: 10 } as any);

            expect(baseGetListSpy).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                sort: 'created_at:DESC',
                filter: {
                    status: 'active',
                },
            });
        });
    });

    describe('findBySlug', () => {
        it('should return null when tag not found', async () => {
            tagRepo.findBySlug.mockResolvedValue(null);

            const result = await service.findBySlug('not-found');
            expect(result).toBeNull();
        });

        it('should return null when tag is not active', async () => {
            tagRepo.findBySlug.mockResolvedValue({ id: 1, status: 'inactive' });

            const result = await service.findBySlug('inactive-tag');
            expect(result).toBeNull();
        });

        it('should transform and return active tag', async () => {
            const tag = { id: 1, status: 'active' };
            tagRepo.findBySlug.mockResolvedValue(tag);

            const result = await service.findBySlug('active-tag');

            expect(tagRepo.findBySlug).toHaveBeenCalledWith('active-tag');
            expect(result).toEqual({ ...tag, transformed: true });
        });
    });
});


