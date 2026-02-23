import { Test, TestingModule } from '@nestjs/testing';
import { BaseService } from '@/common/core/services/base.service';
import { IRepository } from '@/common/core/repositories/repository.interface';
import { NotFoundException } from '@nestjs/common';
import { RequestContext } from '@/common/shared/utils/request-context.util';

// Concrete implementation for testing
class TestService extends BaseService<any, IRepository<any>> {
    constructor(repository: IRepository<any>) {
        super(repository);
    }
}

describe('BaseService', () => {
    let service: TestService;
    let repository: any;

    beforeEach(async () => {
        repository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        service = new TestService(repository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getList', () => {
        it('should call repository.findAll with prepared options', async () => {
            const mockResult = { data: [{ id: 1 }], meta: {} };
            repository.findAll.mockResolvedValue(mockResult);

            const result = await service.getList({ page: 1, limit: 10 });

            expect(repository.findAll).toHaveBeenCalled();
            expect(result.data[0].id).toBe(1);
        });

        it('should return empty result if prepareFilters returns false', async () => {
            // Mock prepareFilters to return false
            (service as any).prepareFilters = jest.fn().mockResolvedValue(false);

            const result = await service.getList();

            expect(repository.findAll).not.toHaveBeenCalled();
            expect(result.data).toEqual([]);
            expect(result.meta.totalItems).toBe(0);
        });
    });

    describe('getOne', () => {
        it('should return item if found', async () => {
            const mockItem = { id: BigInt(1), name: 'Test' };
            repository.findById.mockResolvedValue(mockItem);

            const result = await service.getOne(1);

            expect(repository.findById).toHaveBeenCalledWith(1);
            expect(result.id).toBe(1); // Should be converted to Number by deepConvertBigInt
            expect(typeof result.id).toBe('number');
        });

        it('should throw NotFoundException if not found', async () => {
            repository.findById.mockResolvedValue(null);
            await expect(service.getOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should automatically add group_id if autoAddGroupId is true', async () => {
            (service as any).autoAddGroupId = true;
            repository.create.mockImplementation((data: any) => Promise.resolve({ ...data, id: 1 }));

            jest.spyOn(RequestContext, 'get').mockReturnValue(123);

            const result = await service.create({ name: 'New Item' });

            expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Item',
                group_id: 123
            }));
        });
    });

    describe('deepConvertBigInt', () => {
        it('should recursively convert BigInt to Number', () => {
            const input = {
                a: BigInt(1),
                b: {
                    c: BigInt(2),
                    d: [BigInt(3), { e: BigInt(4) }]
                },
                f: 'string',
                g: new Date()
            };

            const result = (service as any).deepConvertBigInt(input);

            expect(result.a).toBe(1);
            expect(result.b.c).toBe(2);
            expect(result.b.d[0]).toBe(3);
            expect(result.b.d[1].e).toBe(4);
            expect(typeof result.a).toBe('number');
            expect(result.g).toBeInstanceOf(Date);
        });
    });
});




