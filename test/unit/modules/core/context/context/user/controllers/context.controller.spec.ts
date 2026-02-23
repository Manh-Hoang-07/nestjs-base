import { Test, TestingModule } from '@nestjs/testing';
import { ContextController } from '@/modules/core/context/context/user/controllers/context.controller';
import { UserContextService } from '@/modules/core/context/context/user/services/context.service';
import { AuthService } from '@/common/auth/services';

describe('UserContextController', () => {
    let controller: ContextController;
    let service: any;
    let auth: any;

    beforeEach(async () => {
        service = { getUserContextsForTransfer: jest.fn() };
        auth = { id: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ContextController],
            providers: [
                { provide: UserContextService, useValue: service },
                { provide: AuthService, useValue: auth },
            ],
        }).compile();

        controller = module.get<ContextController>(ContextController);
    });

    it('should return empty array if no userId', async () => {
        auth.id.mockReturnValue(null);
        expect(await controller.getUserContexts()).toEqual([]);
    });

    it('should return formatted contexts from service', async () => {
        auth.id.mockReturnValue(1);
        service.getUserContextsForTransfer.mockResolvedValue([
            { id: BigInt(10), type: 'branch', name: 'B1' }
        ]);

        const result = await controller.getUserContexts();
        expect(result[0].id).toBe('10');
        expect(result[0].type).toBe('branch');
    });
});




