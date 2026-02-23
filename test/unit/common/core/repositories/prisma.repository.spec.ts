import { Test, TestingModule } from '@nestjs/testing';
import { PrismaRepository, PrismaDelegate } from '@/common/core/repositories/prisma.repository';

// Mock Delegate
const mockDelegate: any = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
};

// Concrete Repository for testing abstract PrismaRepository
class TestRepository extends PrismaRepository<any> {
    constructor() {
        super(mockDelegate);
    }

    protected buildWhere(filter: Record<string, any>): any {
        return { ...filter };
    }

    // public exposure for protected methods if needed
    public parseSort(sortStr: string) {
        return super.parseSort(sortStr);
    }

    public toPrimaryKey(id: any) {
        return super.toPrimaryKey(id);
    }

    // getters/setters for protected properties
    public setIsSoftDelete(val: boolean) {
        this.isSoftDelete = val;
    }

    public setDefaultSelect(val: any) {
        this.defaultSelect = val;
    }
}

describe('PrismaRepository', () => {
    let repository: TestRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TestRepository,
            ],
        }).compile();

        repository = module.get<TestRepository>(TestRepository);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('parseSort', () => {
        it('should parse sort string to Prisma order by array', () => {
            const result = repository.parseSort('created_at:asc,name:desc,id');
            expect(result).toEqual([
                { created_at: 'asc' },
                { name: 'desc' },
                { id: 'desc' }
            ]);
        });
    });

    describe('toPrimaryKey', () => {
        it('should convert un-nested object correctly', () => {
            expect(repository.toPrimaryKey({ id: 5n })).toBe(5n);
        });

        it('should return bigint if number is passed', () => {
            expect(repository.toPrimaryKey(5)).toBe(5n);
        });

        it('should return bigint if biging is passed', () => {
            expect(repository.toPrimaryKey(5n)).toBe(5n);
        });

        it('should return bigint if string number is passed', () => {
            expect(repository.toPrimaryKey('5')).toBe(5n);
        });

        it('should throw error on invalid string format', () => {
            expect(() => repository.toPrimaryKey('invalid')).toThrowError(/Invalid ID format/);
        });
    });

    describe('findAll', () => {
        it('should return paginated result with soft delete support', async () => {
            mockDelegate.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
            mockDelegate.count.mockResolvedValue(2);
            repository.setIsSoftDelete(true);

            const result = await repository.findAll({ page: 2, limit: 1, sort: 'id:desc' });

            expect(mockDelegate.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { deleted_at: null },
                orderBy: [{ id: 'desc' }],
                skip: 1,
                take: 1
            }));

            expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
            expect(result.meta.totalItems).toBe(2);
        });
    });

    describe('findById', () => {
        it('should return correct entity', async () => {
            mockDelegate.findFirst.mockResolvedValue({ id: 1 });
            const result = await repository.findById(1);
            expect(mockDelegate.findFirst).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 1n }
            }));
            expect(result).toEqual({ id: 1 });
        });
    });

    describe('create', () => {
        it('should delegate create call', async () => {
            mockDelegate.create.mockResolvedValue({ id: 1, name: 'new' });
            const result = await repository.create({ name: 'new' });
            expect(mockDelegate.create).toHaveBeenCalledWith({ data: { name: 'new' } });
            expect(result).toEqual({ id: 1, name: 'new' });
        });
    });

    describe('delete', () => {
        it('should soft delete if isSoftDelete is true', async () => {
            mockDelegate.update.mockResolvedValue({ id: 1 });
            repository.setIsSoftDelete(true);

            const result = await repository.delete(1);

            expect(mockDelegate.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 1n },
            }));
            expect(result).toBe(true);
        });

        it('should hard delete if isSoftDelete is false', async () => {
            mockDelegate.delete.mockResolvedValue({ id: 1 });
            repository.setIsSoftDelete(false);

            const result = await repository.delete(1);

            expect(mockDelegate.delete).toHaveBeenCalledWith({ where: { id: 1n } });
            expect(result).toBe(true);
        });

        it('should return false if operation throws', async () => {
            mockDelegate.update.mockRejectedValue(new Error('error'));
            const result = await repository.delete(1);
            expect(result).toBe(false);
        });
    });

    describe('count', () => {
        it('should count elements merging filter and soft delete', async () => {
            mockDelegate.count.mockResolvedValue(5);
            repository.setIsSoftDelete(true);
            const result = await repository.count({ status: 'active' });

            expect(mockDelegate.count).toHaveBeenCalledWith({ where: { status: 'active', deleted_at: null } });
            expect(result).toBe(5);
        });
    });
});




