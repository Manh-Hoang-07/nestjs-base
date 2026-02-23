import { Test, TestingModule } from '@nestjs/testing';
import { UserContextService } from '@/modules/core/context/context/user/services/context.service';
import { CONTEXT_REPOSITORY } from '@/modules/core/context/context/domain/context.repository';
import { GROUP_REPOSITORY } from '@/modules/core/context/group/domain/group.repository';
import { USER_GROUP_REPOSITORY } from '@/modules/core/rbac/user-group/domain/user-group.repository';

describe('UserContextService', () => {
    let service: UserContextService;
    let contextRepo: any;
    let groupRepo: any;
    let userGroupRepo: any;

    beforeEach(async () => {
        contextRepo = {
            findManyRaw: jest.fn(),
            findOne: jest.fn(),
            findActiveByIds: jest.fn(),
            findById: jest.fn(),
        };
        groupRepo = {
            findManyRaw: jest.fn(),
            findActiveByIds: jest.fn(),
        };
        userGroupRepo = {
            findManyRaw: jest.fn(),
            findByUserId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserContextService,
                { provide: CONTEXT_REPOSITORY, useValue: contextRepo },
                { provide: GROUP_REPOSITORY, useValue: groupRepo },
                { provide: USER_GROUP_REPOSITORY, useValue: userGroupRepo },
            ],
        }).compile();

        service = module.get<UserContextService>(UserContextService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getUserContexts', () => {
        it('should return contexts mapped to user groups', async () => {
            userGroupRepo.findByUserId.mockResolvedValue([{ group_id: 10 }]);
            groupRepo.findActiveByIds.mockResolvedValue([{ id: BigInt(10), context_id: 100 }]);
            contextRepo.findActiveByIds.mockResolvedValue([{ id: BigInt(100), name: 'CTX 1', status: 'active' }]);

            const result = await service.getUserContexts(1);

            expect(result.length).toBe(1);
            expect(result[0].id).toBe(100);
            expect(result[0].name).toBe('CTX 1');
        });

        it('should return empty if user has no groups', async () => {
            userGroupRepo.findByUserId.mockResolvedValue([]);
            const result = await service.getUserContexts(1);
            expect(result).toEqual([]);
        });
    });

    describe('getUserContextsForTransfer', () => {
        it('should include system context (ID=1)', async () => {
            contextRepo.findById.mockResolvedValue({ id: BigInt(1), name: 'System', status: 'active' }); // System context
            userGroupRepo.findByUserId.mockResolvedValue([]); // No other contexts

            const result = await service.getUserContextsForTransfer(1);

            expect(result.length).toBe(1);
            expect(result[0].id).toBe(1);
        });
    });
});




