import { Test, TestingModule } from '@nestjs/testing';
import { PostTagService } from '@/modules/post/post-tag/admin/services/post-tag.service';
import { POST_TAG_REPOSITORY } from '@/modules/post/post-tag/domain/post-tag.repository';

describe('PostTagService', () => {
    let service: PostTagService;
    let tagRepo: any;

    beforeEach(async () => {
        tagRepo = {
            findById: jest.fn(),
            findFirstRaw: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostTagService,
                {
                    provide: POST_TAG_REPOSITORY,
                    useValue: tagRepo,
                },
            ],
        }).compile();

        service = module.get<PostTagService>(PostTagService);

        jest.spyOn(service as any, 'getList').mockResolvedValue('list_result');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getSimpleList', () => {
        it('should call getList with default limit 1000', async () => {
            const query = { search: 'tag' };

            const result = await service.getSimpleList(query as any);

            expect((service as any).getList).toHaveBeenCalledWith({
                ...query,
                limit: 1000,
            });
            expect(result).toBe('list_result');
        });
    });

    describe('beforeCreate', () => {
        it('should clone data and call ensureSlug', async () => {
            const data = { name: 'Tech', slug: '' };
            const ensureSlugSpy = jest
                .spyOn(service as any, 'ensureSlug')
                .mockResolvedValue(undefined);

            const result = await (service as any).beforeCreate(data);

            expect(ensureSlugSpy).toHaveBeenCalledTimes(1);
            const [payloadArg] = ensureSlugSpy.mock.calls[0];
            expect(payloadArg).toEqual(data);
            // make sure clone is used
            expect(payloadArg).not.toBe(data);
            expect(result).toEqual(payloadArg);
        });
    });

    describe('beforeUpdate', () => {
        it('should load current tag and call ensureSlug with current slug', async () => {
            const current = { id: 1, slug: 'old-slug' };
            tagRepo.findById.mockResolvedValue(current);

            const data = { name: 'New name' };
            const ensureSlugSpy = jest
                .spyOn(service as any, 'ensureSlug')
                .mockResolvedValue(undefined);

            const result = await (service as any).beforeUpdate(1, data);

            expect(tagRepo.findById).toHaveBeenCalledWith(1);
            expect(ensureSlugSpy).toHaveBeenCalledTimes(1);
            const [payloadArg, idArg, currentSlugArg] = ensureSlugSpy.mock.calls[0];
            expect(payloadArg).toEqual(data);
            expect(idArg).toBe(1);
            expect(currentSlugArg).toBe('old-slug');
            expect(result).toEqual(payloadArg);
        });

        it('should call ensureSlug even when current has no slug', async () => {
            tagRepo.findById.mockResolvedValue({ id: 1 });

            const data = { name: 'New name' };
            const ensureSlugSpy = jest
                .spyOn(service as any, 'ensureSlug')
                .mockResolvedValue(undefined);

            await (service as any).beforeUpdate(1, data);

            const [, , currentSlugArg] = ensureSlugSpy.mock.calls[0];
            expect(currentSlugArg).toBeUndefined();
        });
    });
});

