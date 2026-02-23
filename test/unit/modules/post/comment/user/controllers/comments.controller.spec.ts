import { Test, TestingModule } from '@nestjs/testing';
import { UserPostCommentsController } from '@/modules/post/comment/user/controllers/comments.controller';
import { UserPostCommentsService } from '@/modules/post/comment/user/services/comments.service';
import { SanitizeHtmlPipe } from '@/modules/post/shared/pipes/sanitize-html.pipe';

describe('UserPostCommentsController', () => {
    let controller: UserPostCommentsController;
    let service: any;

    beforeEach(async () => {
        service = {
            getList: jest.fn(),
            create: jest.fn(),
            updateComment: jest.fn(),
            removeComment: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserPostCommentsController],
            providers: [
                {
                    provide: UserPostCommentsService,
                    useValue: service,
                },
                // Provide pipe explicitly so Nest can construct controller
                SanitizeHtmlPipe,
            ],
        }).compile();

        controller = module.get<UserPostCommentsController>(UserPostCommentsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call getMyComments with default pagination', async () => {
        await controller.getMyComments(undefined as any, undefined as any);
        expect(service.getList).toHaveBeenCalledWith({ by_current_user: true, page: 1, limit: 20 });
    });

    it('should call getMyComments with custom pagination', async () => {
        await controller.getMyComments(2 as any, 5 as any);
        expect(service.getList).toHaveBeenCalledWith({ by_current_user: true, page: 2, limit: 5 });
    });

    it('should call create with body', async () => {
        const body = { post_id: 1, content: 'Test', parent_id: 2 } as any;
        await controller.create(body);
        expect(service.create).toHaveBeenCalledWith(body);
    });

    it('should call update with id and body content', async () => {
        const body = { content: 'Updated' } as any;
        await controller.update(3 as any, body);
        expect(service.updateComment).toHaveBeenCalledWith(3, 'Updated');
    });

    it('should call delete with id', async () => {
        await controller.delete(4 as any);
        expect(service.removeComment).toHaveBeenCalledWith(4);
    });
});


