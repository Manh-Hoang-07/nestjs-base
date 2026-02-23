import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from '@/modules/post/post/admin/controllers/post.controller';
import { PostService } from '@/modules/post/post/admin/services/post.service';
import { CacheInterceptor } from '@/common/cache';

describe('PostController (Admin)', () => {
    let controller: PostController;
    let service: any;

    beforeEach(async () => {
        service = {
            getList: jest.fn(),
            getSimpleList: jest.fn(),
            getOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getViewStats: jest.fn(),
            getStatisticsOverview: jest.fn(),
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

    it('should call getSimpleList', async () => {
        await controller.getSimpleList({ search: 'test' } as any);
        expect(service.getSimpleList).toHaveBeenCalledWith({ search: 'test' });
    });

    it('should call getOne', async () => {
        await controller.getOne(1);
        expect(service.getOne).toHaveBeenCalledWith(1);
    });

    it('should call create', async () => {
        await controller.create({ title: 'Test' } as any);
        expect(service.create).toHaveBeenCalledWith({ title: 'Test' });
    });

    it('should call update', async () => {
        await controller.update(1, { title: 'Updated' } as any);
        expect(service.update).toHaveBeenCalledWith(1, { title: 'Updated' });
    });

    it('should call delete', async () => {
        await controller.delete(1);
        expect(service.delete).toHaveBeenCalledWith(1);
    });

    it('should call getStats', async () => {
        await controller.getStats(1, '2023-01-01', '2023-01-31');
        expect(service.getViewStats).toHaveBeenCalledWith(1, '2023-01-01', '2023-01-31');
    });

    it('should call getStatisticsOverview', async () => {
        await controller.getStatisticsOverview();
        expect(service.getStatisticsOverview).toHaveBeenCalled();
    });
});
