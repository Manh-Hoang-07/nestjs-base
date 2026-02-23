import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from '@/modules/core/notification/user/controllers/notification.controller';
import { NotificationService } from '@/modules/core/notification/admin/services/notification.service';
import { NotFoundException } from '@nestjs/common';
import { JwtAuthGuard, RbacGuard } from '@/common/auth/guards';

describe('NotificationController', () => {
    let controller: NotificationController;
    let service: any;

    beforeEach(async () => {
        service = {
            getList: jest.fn(),
            getOne: jest.fn(),
            markAsReadForUser: jest.fn(),
            markAllAsReadForUser: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotificationController],
            providers: [
                { provide: NotificationService, useValue: service },
            ],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .overrideGuard(RbacGuard).useValue({ canActivate: () => true })
            .compile();

        controller = module.get<NotificationController>(NotificationController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getList', () => {
        it('should call service.getList with userId', async () => {
            const user = { id: 10 };
            const query = { page: 1 };
            await controller.getList({ user: user as any }, query as any);
            expect(service.getList).toHaveBeenCalledWith(expect.objectContaining({ userId: 10 }));
        });
    });

    describe('getOne', () => {
        it('should throw NotFoundException if user does not own notification', async () => {
            service.getOne.mockResolvedValue({ id: 1, user_id: 99 });
            await expect(controller.getOne('1', { user: { id: 10 } as any })).rejects.toThrow(NotFoundException);
        });

        it('should return notification if user owns it', async () => {
            const mockNotif = { id: 1, user_id: 10 };
            service.getOne.mockResolvedValue(mockNotif);
            const result = await controller.getOne('1', { user: { id: 10 } as any });
            expect(result).toBe(mockNotif);
        });
    });

    describe('markAsRead', () => {
        it('should call service.markAsReadForUser', async () => {
            await controller.markAsRead('1', { user: { id: 10 } as any });
            expect(service.markAsReadForUser).toHaveBeenCalledWith(1, 10);
        });
    });
});




