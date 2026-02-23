import { Test, TestingModule } from '@nestjs/testing';
import { AdminPostCommentController } from '@/modules/post/comment/admin/controllers/comment.controller';
import { AdminPostCommentService } from '@/modules/post/comment/admin/services/comment.service';
import { RbacGuard } from '@/common/auth/guards';

describe('AdminPostCommentController', () => {
    let controller: AdminPostCommentController;
    let service: any;

    beforeEach(async () => {
        service = {
            getList: jest.fn(),
            getStatistics: jest.fn(),
            getOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AdminPostCommentController],
            providers: [
                {
                    provide: AdminPostCommentService,
                    useValue: service,
                },
            ],
        })
            .overrideGuard(RbacGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AdminPostCommentController>(AdminPostCommentController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call getList', async () => {
        const query = { page: 1 } as any;
        await controller.getList(query);
        expect(service.getList).toHaveBeenCalledWith(query);
    });

    it('should call getStatistics', async () => {
        await controller.getStatistics();
        expect(service.getStatistics).toHaveBeenCalled();
    });

    it('should call getOne with parsed id', async () => {
        await controller.getOne(5);
        expect(service.getOne).toHaveBeenCalledWith(5);
    });

    it('should call update', async () => {
        const body = { content: 'Updated' } as any;
        await controller.update(3, body);
        expect(service.update).toHaveBeenCalledWith(3, body);
    });

    it('should call updateStatus', async () => {
        const body = { status: 'hidden' as const } as any;
        await controller.updateStatus(4, body);
        expect(service.update).toHaveBeenCalledWith(4, { status: 'hidden' });
    });

    it('should call delete with parsed id', async () => {
        await controller.delete(2);
        expect(service.delete).toHaveBeenCalledWith(2);
    });
});


