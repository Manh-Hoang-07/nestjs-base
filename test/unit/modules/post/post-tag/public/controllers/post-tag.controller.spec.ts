import { Test, TestingModule } from '@nestjs/testing';
import { PostTagController } from '@/modules/post/post-tag/public/controllers/post-tag.controller';
import { PostTagService } from '@/modules/post/post-tag/public/services/post-tag.service';

describe('PostTagController (Public)', () => {
    let controller: PostTagController;
    let service: any;

    beforeEach(async () => {
        service = {
            getList: jest.fn(),
            findBySlug: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostTagController],
            providers: [
                {
                    provide: PostTagService,
                    useValue: service,
                },
            ],
        }).compile();

        controller = module.get<PostTagController>(PostTagController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call getList with query', async () => {
        const query = { page: 1, search: 'test' } as any;
        await controller.getList(query);
        expect(service.getList).toHaveBeenCalledWith(query);
    });

    it('should call getBySlug with slug from dto', async () => {
        await controller.getBySlug({ slug: 'test-slug' } as any);
        expect(service.findBySlug).toHaveBeenCalledWith('test-slug');
    });
});


