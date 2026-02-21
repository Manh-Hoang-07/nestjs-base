import { Test, TestingModule } from '@nestjs/testing';
import { AdminProductVariantService } from './product-variant.service';
import { PRODUCT_VARIANT_REPOSITORY } from '../../domain/product-variant.repository';
import { PRODUCT_VARIANT_ATTRIBUTE_REPOSITORY } from '../../domain/product-variant-attribute.repository';
import { ProductPriceSyncService } from '@/modules/ecommerce/product/infrastructure/services/product-price-sync.service';
import { NotFoundException } from '@nestjs/common';
import { RequestContext } from '@/common/shared/utils/request-context.util';

describe('AdminProductVariantService', () => {
    let service: AdminProductVariantService;
    let repository: any;
    let attributeRepository: any;
    let priceSyncService: any;

    beforeEach(async () => {
        repository = {
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findFirstRaw: jest.fn(),
            toPrimaryKey: jest.fn((id) => id),
        };

        attributeRepository = {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
        };

        priceSyncService = {
            syncProductPrice: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdminProductVariantService,
                {
                    provide: PRODUCT_VARIANT_REPOSITORY,
                    useValue: repository,
                },
                {
                    provide: PRODUCT_VARIANT_ATTRIBUTE_REPOSITORY,
                    useValue: attributeRepository,
                },
                {
                    provide: ProductPriceSyncService,
                    useValue: priceSyncService,
                },
            ],
        }).compile();

        service = module.get<AdminProductVariantService>(AdminProductVariantService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('beforeCreate', () => {
        it('should transform payload correctly', async () => {
            jest.spyOn(RequestContext, 'get').mockImplementation((key) => {
                if (key === 'groupId') return 1;
                return null;
            });

            const input = {
                name: 'Variant 1',
                product_id: 10,
                status: 'active',
                price: '100',
                image: '',
            } as any;

            const result = await (service as any).beforeCreate(input);

            expect(result.name).toBe('Variant 1');
            expect(result.product.connect.id).toBe(BigInt(10));
            expect(result.is_active).toBe(true);
            expect(result.price).toBe('100');
            expect(result.image).toBeNull();
            expect(result.group_id).toBe(1);
        });
    });

    describe('afterCreate', () => {
        it('should create attributes and sync price', async () => {
            const entity = { id: BigInt(1), product_id: BigInt(10) };
            const data = {
                attributes: [
                    { attribute_id: 1, value_id: 100 }
                ]
            } as any;

            await (service as any).afterCreate(entity, data);

            expect(attributeRepository.createMany).toHaveBeenCalled();
            expect(priceSyncService.syncProductPrice).toHaveBeenCalledWith(BigInt(10));
        });
    });

    describe('getOne', () => {
        it('should return variant and verify ownership', async () => {
            const mockVariant = { id: BigInt(1), group_id: 1 };
            repository.findFirstRaw.mockResolvedValue(mockVariant);

            jest.spyOn(RequestContext, 'get').mockImplementation((key) => {
                if (key === 'groupId') return 1;
                if (key === 'contextId') return 2;
                return null;
            });

            const result = await service.getOne(1);
            expect(result).toEqual(mockVariant);
        });

        it('should throw NotFoundException if not found', async () => {
            repository.findFirstRaw.mockResolvedValue(null);
            await expect(service.getOne(1)).rejects.toThrow(NotFoundException);
        });
    });
});
