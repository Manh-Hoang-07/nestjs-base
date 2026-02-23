import { Test, TestingModule } from '@nestjs/testing';
import { AdminContextController } from '@/modules/core/context/context/admin/controllers/context.controller';
import { AdminContextService } from '@/modules/core/context/context/admin/services/context.service';
import { AuthService } from '@/common/auth/services';
import { ForbiddenException } from '@nestjs/common';

describe('AdminContextController', () => {
    let controller: AdminContextController;
    let service: any;
    let auth: any;

    beforeEach(async () => {
        service = {
            createContext: jest.fn(),
            getList: jest.fn(),
            findById: jest.fn(),
            updateContext: jest.fn(),
            deleteContext: jest.fn(),
        };

        auth = {
            id: jest.fn().mockReturnValue(1),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AdminContextController],
            providers: [
                { provide: AdminContextService, useValue: service },
                { provide: AuthService, useValue: auth },
            ],
        }).compile();

        controller = module.get<AdminContextController>(AdminContextController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should throw ForbiddenException if no userId', async () => {
            auth.id.mockReturnValue(null);
            await expect(controller.create({ type: 'test', name: 'Test' })).rejects.toThrow(ForbiddenException);
        });

        it('should call service.createContext', async () => {
            const body = { type: 'test', name: 'Test' };
            await controller.create(body);
            expect(service.createContext).toHaveBeenCalledWith(body, 1);
        });
    });

    describe('getContexts', () => {
        it('should call service.getList', async () => {
            const query = { page: 1 };
            await controller.getContexts(query);
            expect(service.getList).toHaveBeenCalledWith(query);
        });
    });
});




