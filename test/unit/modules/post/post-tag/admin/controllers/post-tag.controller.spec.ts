import { Test, TestingModule } from '@nestjs/testing';
import { PostTagController } from '@/modules/post/post-tag/admin/controllers/post-tag.controller';
import { PostTagService } from '@/modules/post/post-tag/admin/services/post-tag.service';

describe('PostTagController (Admin)', () => {
    let controller: PostTagController;
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
        const query = { search: 'tag' } as any;
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

