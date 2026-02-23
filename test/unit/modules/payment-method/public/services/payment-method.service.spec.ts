import { Test, TestingModule } from '@nestjs/testing';
import { PublicPaymentMethodService } from '@/modules/payment-method/public/services/payment-method.service';
import { PAYMENT_METHOD_REPOSITORY } from '@/modules/payment-method/domain/payment-method.repository';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

describe('PublicPaymentMethodService', () => {
    let service: PublicPaymentMethodService;
    let repository: any;

    beforeEach(async () => {
        repository = {};

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PublicPaymentMethodService,
                { provide: PAYMENT_METHOD_REPOSITORY, useValue: repository },
            ],
        }).compile();

        service = module.get<PublicPaymentMethodService>(PublicPaymentMethodService);

        jest.spyOn(service as any, 'getList').mockResolvedValue('list_result');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('prepareFilters', () => {
        it('should always enforce active status and handle q and type', async () => {
            const query = { q: 'bank', type: 'online' };

            const where = await (service as any).prepareFilters(query);

            expect(where.status).toBe(BasicStatus.active);
            expect(where.OR).toEqual([
                { name: { contains: 'bank' } },
                { code: { contains: 'bank' } },
            ]);
            expect(where.type).toBe('online');
        });
    });
});


