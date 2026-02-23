import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from '@/modules/post/post/public/controllers/post.controller';
import { PostService } from '@/modules/post/post/public/services/post.service';
import { CacheInterceptor } from '@/common/cache';

describe('PostController (Public)', () => {
    let controller: PostController;
    let service: any;

    beforeEach(async () => {
        service = {
            getList: jest.fn(),
            getOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostController],
            providers: [
                {
                    provide: PostService,
                    useValue: service,
                },
            ],
        })
            .overrideInterceptor(CacheInterceptor).useValue({ intercept: (context: any, next: any) => next.handle() })
            .compile();

        controller = module.get<PostController>(PostController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call getList', async () => {
        await controller.getList({ page: 1 } as any);
        expect(service.getList).toHaveBeenCalledWith({ page: 1 });
    });

    it('should call getFeatured with default limit', async () => {
        await controller.getFeatured();
        expect(service.getList).toHaveBeenCalledWith(expect.objectContaining({ is_featured: true, limit: 5 }));
    });

    it('should call getFeatured with custom limit', async () => {
        await controller.getFeatured('10');
        expect(service.getList).toHaveBeenCalledWith(expect.objectContaining({ is_featured: true, limit: 10 }));
    });

    it('should call getBySlug', async () => {
        await controller.getBySlug({ slug: 'test' } as any);
        expect(service.getOne).toHaveBeenCalledWith('test');
    });
});
