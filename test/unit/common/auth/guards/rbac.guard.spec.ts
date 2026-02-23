import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacGuard } from '@/common/auth/guards/rbac.guard';
import { RbacService } from '@/modules/core/rbac/services/rbac.service';
import { Auth } from '@/common/auth/utils';
import { RequestContext } from '@/common/shared/utils';

jest.mock('@/common/auth/utils', () => ({
    Auth: {
        id: jest.fn(),
    },
}));

jest.mock('@/common/shared/utils', () => {
    const original = jest.requireActual('@/common/shared/utils');
    return {
        ...original,
        RequestContext: {
            get: jest.fn(),
            set: jest.fn(),
        }
    };
});

describe('RbacGuard', () => {
    let guard: RbacGuard;
    let reflector: Reflector;
    let rbacService: RbacService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RbacGuard,
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
                {
                    provide: RbacService,
                    useValue: {
                        userHasPermissionsInGroup: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<RbacGuard>(RbacGuard);
        reflector = module.get<Reflector>(Reflector);
        rbacService = module.get<RbacService>(RbacService);

        jest.clearAllMocks();
    });

    const createMockContext = (): ExecutionContext => {
        return {
            getHandler: () => ({}),
            getClass: () => ({}),
        } as unknown as ExecutionContext;
    };

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should throw forbidden if no permissions required', async () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

            await expect(guard.canActivate(createMockContext())).rejects.toThrow(
                expect.objectContaining({
                    status: HttpStatus.FORBIDDEN,
                })
            );
        });

        it('should allow if public permission', async () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['public']);

            const result = await guard.canActivate(createMockContext());
            expect(result).toBe(true);
        });

        it('should throw unauthorized if user id not found', async () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read_dashboard']);
            (Auth.id as jest.Mock).mockReturnValue(null);

            await expect(guard.canActivate(createMockContext())).rejects.toThrow(
                expect.objectContaining({
                    status: HttpStatus.UNAUTHORIZED,
                })
            );
        });

        it('should allow if authenticated or user permission', async () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['authenticated']);
            (Auth.id as jest.Mock).mockReturnValue(1);

            const result = await guard.canActivate(createMockContext());
            expect(result).toBe(true);
        });

        it('should throw forbidden if user lacks permissions in group', async () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['manage_users']);
            (Auth.id as jest.Mock).mockReturnValue(1);
            (RequestContext.get as jest.Mock).mockReturnValue(2); // groupId

            jest.spyOn(rbacService, 'userHasPermissionsInGroup').mockResolvedValue(false);

            await expect(guard.canActivate(createMockContext())).rejects.toThrow(
                expect.objectContaining({
                    status: HttpStatus.FORBIDDEN,
                })
            );

            expect(rbacService.userHasPermissionsInGroup).toHaveBeenCalledWith(1, 2, ['manage_users']);
        });

        it('should return true if user has permissions in group', async () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['manage_users']);
            (Auth.id as jest.Mock).mockReturnValue(1);
            (RequestContext.get as jest.Mock).mockReturnValue(null); // groupId = null

            jest.spyOn(rbacService, 'userHasPermissionsInGroup').mockResolvedValue(true);

            const result = await guard.canActivate(createMockContext());
            expect(result).toBe(true);

            expect(rbacService.userHasPermissionsInGroup).toHaveBeenCalledWith(1, null, ['manage_users']);
        });
    });
});




