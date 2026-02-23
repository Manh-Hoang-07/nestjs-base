import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '@/modules/core/iam/user/admin/controllers/user.controller';
import { UserService } from '@/modules/core/iam/user/admin/services/user.service';

describe('Admin UserController', () => {
    let controller: UserController;
    let service: any;

    beforeEach(async () => {
        service = {
            getList: jest.fn(),
            getSimpleList: jest.fn(),
            getOne: jest.fn(),
            create: jest.fn(),
            updateById: jest.fn(),
            changePassword: jest.fn(),
            deleteById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                { provide: UserService, useValue: service },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getList', () => {
        it('should call service.getList', async () => {
            await controller.getList({ page: 1 });
            expect(service.getList).toHaveBeenCalledWith({ page: 1 });
        });
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto = { email: 'test@test.com' };
            await controller.create(dto as any);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('changePassword', () => {
        it('should call service.changePassword', async () => {
            const dto = { password: 'new' };
            await controller.changePassword('1', dto as any);
            expect(service.changePassword).toHaveBeenCalledWith(1, dto);
        });
    });
});




