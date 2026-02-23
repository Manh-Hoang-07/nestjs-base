import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@/modules/core/iam/user/admin/services/user.service';
import { IUserRepository, USER_REPOSITORY } from '@/modules/core/iam/user/domain/user.repository';
import { RbacService } from '@/modules/core/rbac/services/rbac.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { RequestContext } from '@/common/shared/utils';

jest.mock('bcryptjs');

describe('UserService', () => {
    let service: UserService;
    let userRepo: any;
    let rbacService: any;

    beforeEach(async () => {
        userRepo = {
            findById: jest.fn(),
            findByIdForAuth: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            checkUnique: jest.fn(),
            upsertProfile: jest.fn(),
            toPrimaryKey: jest.fn((id) => id),
        };

        rbacService = {
            syncRolesInGroup: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: USER_REPOSITORY, useValue: userRepo },
                { provide: RbacService, useValue: rbacService },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('beforeCreate', () => {
        it('should hash password and check uniqueness', async () => {
            userRepo.checkUnique.mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pwd');

            const payload = await (service as any).beforeCreate({
                email: 'test@example.com',
                password: 'password123'
            });

            expect(payload.password).toBe('hashed_pwd');
            expect(userRepo.checkUnique).toHaveBeenCalledWith('email', 'test@example.com');
        });

        it('should throw BadRequestException if email exists', async () => {
            userRepo.checkUnique.mockResolvedValue(false);
            await expect((service as any).beforeCreate({ email: 'exists@example.com' })).rejects.toThrow(BadRequestException);
        });
    });

    describe('afterCreate', () => {
        it('should upsert profile and sync roles', async () => {
            const user = { id: BigInt(1) };
            const data = { profile: { name: 'John' }, role_ids: [1, 2] };

            jest.spyOn(RequestContext, 'get').mockReturnValue(123); // Mock groupId

            await (service as any).afterCreate(user, data);

            expect(userRepo.upsertProfile).toHaveBeenCalledWith(BigInt(1), data.profile);
            expect(rbacService.syncRolesInGroup).toHaveBeenCalledWith(1, 123, [1, 2], true);
        });
    });

    describe('beforeUpdate', () => {
        it('should hash password and check uniqueness excluding self', async () => {
            userRepo.checkUnique.mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pwd');

            const payload = await (service as any).beforeUpdate(1, {
                email: 'test@example.com',
                password: 'password123'
            });

            expect(payload.password).toBe('hashed_pwd');
            expect(userRepo.checkUnique).toHaveBeenCalledWith('email', 'test@example.com', 1);
        });
    });

    describe('transform', () => {
        it('should extract role_ids for current group', () => {
            jest.spyOn(RequestContext, 'get').mockReturnValue(10); // groupId=10
            const user = {
                id: 1,
                user_role_assignments: [
                    { group_id: 10, role_id: 100 },
                    { group_id: 20, role_id: 200 }
                ]
            };
            const result = (service as any).transform(user);
            expect(result.role_ids).toEqual([100]);
            expect(result.user_role_assignments).toBeUndefined();
        });
    });

    describe('userChangePassword', () => {
        it('should throw BadRequestException if old password does not match', async () => {
            userRepo.findByIdForAuth.mockResolvedValue({ id: 1, password: 'hashed_old' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.userChangePassword(1, 'wrong', 'new')).rejects.toThrow(BadRequestException);
        });

        it('should update password if match', async () => {
            userRepo.findByIdForAuth.mockResolvedValue({ id: 1, password: 'hashed_old' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_new');

            await service.userChangePassword(1, 'old', 'new');
            expect(userRepo.update).toHaveBeenCalledWith(1, { password: 'hashed_new' });
        });
    });
});




