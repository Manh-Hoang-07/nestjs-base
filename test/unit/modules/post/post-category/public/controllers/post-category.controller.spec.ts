import { Test, TestingModule } from '@nestjs/testing';
import { PostCategoryController } from '@/modules/post/post-category/public/controllers/post-category.controller';
import { PostCategoryService } from '@/modules/post/post-category/public/services/post-category.service';

describe('PostCategoryController (Public)', () => {
    let controller: PostCategoryController;
    let service: any;

    beforeEach(async () => {
        service = {
            getList: jest.fn(),
            findBySlug: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostCategoryController],
            providers: [
                {
                    provide: PostCategoryService,
                    useValue: service,
                },
            ],
        }).compile();

        controller = module.get<PostCategoryController>(PostCategoryController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call getList with query', async () => {
        const query = { page: 1, parentId: 2 } as any;
        await controller.getList(query);
        expect(service.getList).toHaveBeenCalledWith(query);
    });

    it('should call getBySlug with slug from dto', async () => {
        await controller.getBySlug({ slug: 'category-slug' } as any);
        expect(service.findBySlug).toHaveBeenCalledWith('category-slug');
    });
});


