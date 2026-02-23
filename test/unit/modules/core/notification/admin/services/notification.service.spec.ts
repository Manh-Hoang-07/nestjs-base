import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '@/modules/core/notification/admin/services/notification.service';
import { NOTIFICATION_REPOSITORY } from '@/modules/core/notification/domain/notification.repository';
import { NotFoundException } from '@nestjs/common';

describe('NotificationService', () => {
    let service: NotificationService;
    let repository: any;

    beforeEach(async () => {
        repository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn(),
            toPrimaryKey: jest.fn((id) => id),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationService,
                { provide: NOTIFICATION_REPOSITORY, useValue: repository },
            ],
        }).compile();

        service = module.get<NotificationService>(NotificationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('markAsReadForUser', () => {
        it('should throw NotFoundException if notification belongs to another user', async () => {
            repository.findById.mockResolvedValue({ id: 1, user_id: BigInt(99) });
            await expect(service.markAsReadForUser(1, 1)).rejects.toThrow(NotFoundException);
        });

        it('should call markAsRead if belongs to user', async () => {
            repository.findById.mockResolvedValue({ id: 1, user_id: BigInt(1) });
            repository.markAsRead.mockResolvedValue({ id: 1, is_read: true });

            const result = await service.markAsReadForUser(1, 1);
            expect(repository.markAsRead).toHaveBeenCalledWith(1);
            expect(result.is_read).toBe(true);
        });
    });

    describe('beforeCreate', () => {
        it('should convert user_id to BigInt', async () => {
            const data = { user_id: 5, title: 'Test' };
            const result = await (service as any).beforeCreate(data);
            expect(result.user_id).toBe(BigInt(5));
        });
    });
});




