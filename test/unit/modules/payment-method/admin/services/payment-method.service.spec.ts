import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMethodService } from '@/modules/payment-method/admin/services/payment-method.service';
import { PAYMENT_METHOD_REPOSITORY } from '@/modules/payment-method/domain/payment-method.repository';

describe('PaymentMethodService', () => {
    let service: PaymentMethodService;
    let repository: any;

    beforeEach(async () => {
        repository = {
            findMany: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentMethodService,
                { provide: PAYMENT_METHOD_REPOSITORY, useValue: repository },
            ],
        }).compile();

        service = module.get<PaymentMethodService>(PaymentMethodService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('prepareFilters', () => {
        it('should handle q, status and type', async () => {
            const filters = { q: 'test', status: 'active', type: 'online' };
            const result = await (service as any).prepareFilters(filters);

            expect(result).toEqual({
                OR: [{ name: { contains: 'test' } }, { code: { contains: 'test' } }],
                status: 'active',
                type: 'online'
            });
        });

        it('should handle empty filters', async () => {
            const result = await (service as any).prepareFilters({});
            expect(result).toEqual({});
        });
    });

    describe('beforeCreate', () => {
        it('should clean payload and set default status', async () => {
            const data = {
                name: 'Test',
                is_active: true,
                display_order: 1,
                icon: 'icon.png',
                updated_user_id: 1,
                code: 'TEST'
            };
            const result = await (service as any).beforeCreate(data);

            expect(result).toEqual({ name: 'Test', code: 'TEST', status: 'active' });
            expect(result.is_active).toBeUndefined();
        });
    });

    describe('beforeUpdate', () => {
        it('should clean payload without modifying status if not provided', async () => {
            const data = {
                name: 'Test Updated',
                is_active: true,
                display_order: 1,
            };
            const result = await (service as any).beforeUpdate(1n, data);

            expect(result).toEqual({ name: 'Test Updated' });
            expect(result.is_active).toBeUndefined();
        });
    });
});
