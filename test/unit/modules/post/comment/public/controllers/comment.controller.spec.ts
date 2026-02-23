import { Test, TestingModule } from '@nestjs/testing';
import { PostCommentController } from '@/modules/post/comment/public/controllers/comment.controller';
import { PostCommentService } from '@/modules/post/comment/public/services/comment.service';
import { JwtAuthGuard } from '@/common/auth/guards';
import { TokenBlacklistService } from '@/core/security/token-blacklist.service';

describe('PostCommentController (Public)', () => {
    let controller: PostCommentController;
    let service: any;

    beforeEach(async () => {
        service = {
            getCommentsByPost: jest.fn(),
            createComment: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostCommentController],
            providers: [
                {
                    provide: PostCommentService,
                    useValue: service,
                },
                // Satisfy JwtAuthGuard constructor deps when overridden
                { provide: TokenBlacklistService, useValue: { has: jest.fn().mockResolvedValue(false) } },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<PostCommentController>(PostCommentController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call getComments with parsed ids and default pagination', async () => {
        await controller.getComments('5', undefined as any, undefined as any);
        expect(service.getCommentsByPost).toHaveBeenCalledWith(5, { page: 1, limit: 10 });
    });

    it('should call getComments with custom pagination', async () => {
        await controller.getComments('5', '2', '25');
        expect(service.getCommentsByPost).toHaveBeenCalledWith(5, { page: 2, limit: 25 });
    });

    it('should call createComment with mapped payload', async () => {
        const req = { user: { id: 99 } } as any;
        await controller.createComment('10', { content: 'Hello', parent_id: '3' } as any, req);

        expect(service.createComment).toHaveBeenCalledWith({
            post_id: 10,
            user_id: 99,
            content: 'Hello',
            parent_id: 3,
        });
    });

    it('should call createComment without parent_id when not provided', async () => {
        const req = { user: { id: 42 } } as any;
        await controller.createComment('7', { content: 'No parent' } as any, req);

        expect(service.createComment).toHaveBeenCalledWith({
            post_id: 7,
            user_id: 42,
            content: 'No parent',
            parent_id: undefined,
        });
    });
});


