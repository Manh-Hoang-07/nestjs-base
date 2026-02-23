import { Test, TestingModule } from '@nestjs/testing';
import { AdminGroupService } from '@/modules/core/context/group/admin/services/group.service';
import { GROUP_REPOSITORY } from '@/modules/core/context/group/domain/group.repository';
import { CONTEXT_REPOSITORY } from '@/modules/core/context/context/domain/context.repository';
import { USER_GROUP_REPOSITORY } from '@/modules/core/rbac/user-group/domain/user-group.repository';
import { ROLE_REPOSITORY } from '@/modules/core/iam/role/domain/role.repository';
import { RbacService } from '@/modules/core/rbac/services/rbac.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('AdminGroupService', () => {
    let service: AdminGroupService;
    let groupRepo: any;
    let contextRepo: any;
    let userGroupRepo: any;
    let roleRepo: any;
    let rbacService: any;

    beforeEach(async () => {
        groupRepo = {
            findById: jest.fn(),
            findByCode: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            toPrimaryKey: jest.fn((id) => id),
        };

        contextRepo = {
            findById: jest.fn(),
        };

        userGroupRepo = {
            findUnique: jest.fn(),
            create: jest.fn(),
        };

        roleRepo = {
            findOne: jest.fn(),
        };

        rbacService = {
            userHasPermissionsInGroup: jest.fn(),
            assignRoleToUser: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdminGroupService,
                {
                    provide: GROUP_REPOSITORY,
                    useValue: groupRepo,
                },
                {
                    provide: CONTEXT_REPOSITORY,
                    useValue: contextRepo,
                },
                {
                    provide: USER_GROUP_REPOSITORY,
                    useValue: userGroupRepo,
                },
                {
                    provide: ROLE_REPOSITORY,
                    useValue: roleRepo,
                },
                {
                    provide: RbacService,
                    useValue: rbacService,
                },
            ],
        }).compile();

        service = module.get<AdminGroupService>(AdminGroupService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createGroup', () => {
        it('should throw ForbiddenException if user is not system admin', async () => {
            rbacService.userHasPermissionsInGroup.mockResolvedValue(false);
            await expect(service.createGroup({}, 1)).rejects.toThrow(ForbiddenException);
        });
    });

    describe('beforeCreate', () => {
        it('should throw NotFoundException if context not found or inactive', async () => {
            contextRepo.findById.mockResolvedValue(null);
            await expect((service as any).beforeCreate({ context_id: 1 })).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if group code already exists', async () => {
            contextRepo.findById.mockResolvedValue({ id: 1, status: 'active' });
            groupRepo.findByCode.mockResolvedValue({ id: 2 });
            await expect((service as any).beforeCreate({ context_id: 1, code: 'G1' })).rejects.toThrow(BadRequestException);
        });

        it('should return valid payload', async () => {
            contextRepo.findById.mockResolvedValue({ id: 1, status: 'active' });
            groupRepo.findByCode.mockResolvedValue(null);

            const result = await (service as any).beforeCreate({ context_id: 1, code: 'G1', owner_id: 10 });
            expect(result.context_id).toBe(BigInt(1));
            expect(result.owner_id).toBe(BigInt(10));
        });
    });

    describe('afterCreate', () => {
        it('should assign owner to user_group and give admin role', async () => {
            const group = { id: BigInt(2), owner_id: BigInt(10) };
            userGroupRepo.findUnique.mockResolvedValue(null);
            roleRepo.findOne.mockResolvedValue({ id: BigInt(5) });

            await (service as any).afterCreate(group);

            expect(userGroupRepo.create).toHaveBeenCalledWith({
                user_id: BigInt(10),
                group_id: BigInt(2),
            });
            expect(rbacService.assignRoleToUser).toHaveBeenCalledWith(10, 5, 2);
        });
    });
});




