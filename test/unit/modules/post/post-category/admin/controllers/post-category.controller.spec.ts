import { Test, TestingModule } from '@nestjs/testing';
import { PostCategoryController } from '@/modules/post/post-category/admin/controllers/post-category.controller';
import { PostCategoryService } from '@/modules/post/post-category/admin/services/post-category.service';

describe('PostCategoryController (Admin)', () => {
    let controller: PostCategoryController;
    let service: any;

    beforeEach(async () => {
        service = {
            getList: jest.fn(),
            getSimpleList: jest.fn(),
            getOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
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

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call getList', async () => {
        const query = { page: 1 } as any;
        await controller.getList(query);
        expect(service.getList).toHaveBeenCalledWith(query);
    });

    it('should call getSimpleList', async () => {
        const query = { search: 'cat' } as any;
        await controller.getSimpleList(query);
        expect(service.getSimpleList).toHaveBeenCalledWith(query);
    });

    it('should call getOne', async () => {
        await controller.getOne(1);
        expect(service.getOne).toHaveBeenCalledWith(1);
    });

    it('should call create', async () => {
        const dto = { name: 'Tech' } as any;
        await controller.create(dto);
        expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should call update', async () => {
        const dto = { name: 'Updated' } as any;
        await controller.update(1, dto);
        expect(service.update).toHaveBeenCalledWith(1, dto);
    });

    it('should call delete', async () => {
        await controller.delete(1);
        expect(service.delete).toHaveBeenCalledWith(1);
    });
});

