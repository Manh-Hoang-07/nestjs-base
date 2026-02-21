import { Test, TestingModule } from '@nestjs/testing';
import { CartManagementService } from './cart-management.service';
import { CART_REPOSITORY } from '../../domain/cart.repository';
import { CART_ITEM_REPOSITORY } from '../../domain/cart-item.repository';
import { NotFoundException } from '@nestjs/common';

describe('CartManagementService', () => {
    let service: CartManagementService;
    let cartRepository: any;
    let cartItemRepository: any;

    beforeEach(async () => {
        cartRepository = {
            findByUserId: jest.fn(),
            findByUuid: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            findFirstRaw: jest.fn(),
            toPrimaryKey: jest.fn((id) => id),
        };

        cartItemRepository = {
            deleteMany: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartManagementService,
                {
                    provide: CART_REPOSITORY,
                    useValue: cartRepository,
                },
                {
                    provide: CART_ITEM_REPOSITORY,
                    useValue: cartItemRepository,
                },
            ],
        }).compile();

        service = module.get<CartManagementService>(CartManagementService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getOrCreateCart', () => {
        it('should return existing cart for user if userId is provided', async () => {
            const mockCart = { id: 1, uuid: 'uuid-1', owner_key: 'user_1' };
            cartRepository.findByUserId.mockResolvedValue(mockCart);

            const result = await service.getOrCreateCart(undefined, 1);

            expect(cartRepository.findByUserId).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockCart);
        });

        it('should return existing cart by uuid if userId not provided', async () => {
            const mockCart = { id: 1, uuid: 'uuid-1', owner_key: 'guest_1' };
            cartRepository.findByUuid.mockResolvedValue(mockCart);

            const result = await service.getOrCreateCart('uuid-1');

            expect(cartRepository.findByUuid).toHaveBeenCalledWith('uuid-1');
            expect(result).toEqual(mockCart);
        });

        it('should create new cart if none found', async () => {
            cartRepository.findByUuid.mockResolvedValue(null);
            cartRepository.create.mockImplementation((data: any) => Promise.resolve({ ...data, id: 1 }));

            const result = await service.getOrCreateCart('new-uuid');

            expect(cartRepository.create).toHaveBeenCalled();
            expect(result.uuid).toBe('new-uuid');
        });
    });

    describe('getCartSummary', () => {
        it('should return formatted cart summary', async () => {
            const mockFullCart = {
                id: BigInt(1),
                uuid: 'uuid-1',
                owner_key: 'user_1',
                subtotal: 100,
                tax_amount: 10,
                shipping_amount: 5,
                discount_amount: 0,
                total_amount: 115,
                items: [
                    {
                        id: BigInt(1),
                        cart_header_id: BigInt(1),
                        product_id: BigInt(10),
                        product: { is_digital: true },
                        variant: { name: 'V1', price: 100 }
                    }
                ]
            };
            cartRepository.findFirstRaw.mockResolvedValue(mockFullCart);

            const result = await service.getCartSummary({ id: BigInt(1) } as any);

            expect(result.cart_id).toBe(1);
            expect(result.cart_type).toBe('digital');
            expect(result.items[0].id).toBe(1);
        });

        it('should throw NotFoundException if cart not found', async () => {
            cartRepository.findFirstRaw.mockResolvedValue(null);

            await expect(service.getCartSummary({ id: BigInt(1) } as any)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getCartById', () => {
        it('should return cart if found', async () => {
            const mockCart = { id: 1 };
            cartRepository.findById.mockResolvedValue(mockCart);

            const result = await service.getCartById(1);
            expect(result).toEqual(mockCart);
        });

        it('should throw NotFoundException if cart not found', async () => {
            cartRepository.findById.mockResolvedValue(null);

            await expect(service.getCartById(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('calculateCartType', () => {
        it('should return digital if all items are digital', () => {
            const items = [{ product: { is_digital: true } }];
            const result = (service as any).calculateCartType(items);
            expect(result).toBe('digital');
        });

        it('should return physical if all items are physical', () => {
            const items = [{ product: { is_digital: false } }];
            const result = (service as any).calculateCartType(items);
            expect(result).toBe('physical');
        });

        it('should return mixed if both digital and physical items present', () => {
            const items = [
                { product: { is_digital: true } },
                { product: { is_digital: false } }
            ];
            const result = (service as any).calculateCartType(items);
            expect(result).toBe('mixed');
        });
    });
});
