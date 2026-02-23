import { Test, TestingModule } from '@nestjs/testing';
import { MenuService } from '@/modules/core/menu/admin/services/menu.service';
import { MENU_REPOSITORY } from '@/modules/core/menu/domain/menu.repository';
import { RbacService } from '@/modules/core/rbac/services/rbac.service';
import { RequestContext } from '@/common/shared/utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MenuService', () => {
    let service: MenuService;
    let menuRepo: any;
    let rbacService: any;

    beforeEach(async () => {
        menuRepo = {
            findByCode: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            findAllWithChildren: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            toPrimaryKey: jest.fn((id) => id),
        };

        rbacService = {
            userHasPermissionsInGroup: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MenuService,
                {
                    provide: MENU_REPOSITORY,
                    useValue: menuRepo,
                },
                {
                    provide: RbacService,
                    useValue: rbacService,
                },
            ],
        }).compile();

        service = module.get<MenuService>(MenuService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('beforeCreate', () => {
        it('should throw BadRequestException if code already exists', async () => {
            menuRepo.findByCode.mockResolvedValue({ id: 1 });
            await expect((service as any).beforeCreate({ code: 'CODE' })).rejects.toThrow(BadRequestException);
        });

        it('should convert IDs to BigInt', async () => {
            menuRepo.findByCode.mockResolvedValue(null);
            const result = await (service as any).beforeCreate({ parent_id: 10, required_permission_id: 20 });
            expect(result.parent_id).toBe(BigInt(10));
            expect(result.required_permission_id).toBe(BigInt(20));
        });
    });

    describe('getUserMenus', () => {
        it('should return empty array if no menus found', async () => {
            menuRepo.findAllWithChildren.mockResolvedValue([]);
            const result = await service.getUserMenus(1, { group: 'client' });
            expect(result).toEqual([]);
        });

        it('should filter client menus correctly', async () => {
            const mockMenus = [
                { id: 1, is_public: true, show_in_menu: true, code: 'm1' },
                { id: 2, is_public: false, show_in_menu: true, code: 'm2' }
            ];
            menuRepo.findAllWithChildren.mockResolvedValue(mockMenus);

            // No userId -> only public
            const result1 = await service.getUserMenus(undefined, { group: 'client' });
            expect(result1.length).toBe(1);
            expect(result1[0].id).toBe(1);

            // With userId -> all client menus (simplified logic in service)
            const result2 = await service.getUserMenus(1, { group: 'client' });
            expect(result2.length).toBe(2);
        });

        it('should filter admin menus based on permissions', async () => {
            const mockMenus = [
                {
                    id: 1, code: 'm1', show_in_menu: true,
                    required_permission_id: BigInt(10),
                    required_permission: { code: 'p1' }
                },
                {
                    id: 2, code: 'm2', show_in_menu: true,
                    required_permission_id: BigInt(11),
                    required_permission: { code: 'p2' }
                }
            ];
            menuRepo.findAllWithChildren.mockResolvedValue(mockMenus);

            jest.spyOn(RequestContext, 'get').mockImplementation((key) => {
                if (key === 'context') return { type: 'system' };
                return null;
            });

            rbacService.userHasPermissionsInGroup.mockImplementation((userId: number, groupId: number | null, perms: string[]) => {
                if (perms.includes('p1')) return Promise.resolve(true);
                return Promise.resolve(false);
            });

            const result = await service.getUserMenus(1, { group: 'admin' });
            expect(result.length).toBe(1);
            expect(result[0].code).toBe('m1');
        });
    });

    describe('buildTree', () => {
        it('should correctly build menu tree', () => {
            const menus = [
                { id: BigInt(1), name: 'P1', parent_id: null, sort_order: 1 },
                { id: BigInt(2), name: 'C1', parent_id: BigInt(1), sort_order: 1 },
                { id: BigInt(3), name: 'C2', parent_id: BigInt(1), sort_order: 2 },
            ];
            const result = (service as any).buildTree(menus);
            expect(result.length).toBe(1);
            expect(result[0].children.length).toBe(2);
            expect(result[0].children[0].name).toBe('C1');
            expect(result[0].children[1].name).toBe('C2');
        });
    });
});




