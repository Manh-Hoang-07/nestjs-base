import { Test, TestingModule } from '@nestjs/testing';
import { BaseContentService } from '@/common/core/services/base-content.service';
import { IRepository } from '@/common/core/repositories/repository.interface';
import { StringUtil } from '@/core/utils/string.util';
import { NotFoundException } from '@nestjs/common';

// Mocks
class MockRepository implements IRepository<any> {
    findAll = jest.fn();
    findOne = jest.fn();
    findById = jest.fn();
    findManyByIds = jest.fn();
    findMany = jest.fn();
    findFirstRaw = jest.fn();
    findManyRaw = jest.fn();
    create = jest.fn();
    update = jest.fn();
    updateMany = jest.fn();
    upsert = jest.fn();
    delete = jest.fn();
    deleteMany = jest.fn();
    exists = jest.fn();
    count = jest.fn();
}

class TestContentService extends BaseContentService<any, MockRepository> {
    constructor(repository: MockRepository) {
        super(repository);
    }

    public async publicEnsureSlug(data: any, currentId?: any, currentSlug?: string) {
        return this.ensureSlug(data, currentId, currentSlug);
    }
}

describe('BaseContentService', () => {
    let service: TestContentService;
    let repository: MockRepository;

    beforeEach(async () => {
        repository = new MockRepository();
        service = new TestContentService(repository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('ensureSlug', () => {
        it('should create slug from name if slug not provided', async () => {
            const data: any = { name: 'Test Title' };
            repository.findFirstRaw.mockResolvedValue(null);

            await service.publicEnsureSlug(data);

            expect(data['slug']).toBe('test-title');
            expect(repository.findFirstRaw).toHaveBeenCalled();
        });

        it('should convert custom slug to valid format', async () => {
            const data: any = { name: 'Test Title', slug: 'mY cUstOm sliG @@' };
            repository.findFirstRaw.mockResolvedValue(null);

            await service.publicEnsureSlug(data);

            expect(data['slug']).toBe('my-custom-slig');
        });

        it('should skip if slug has not changed', async () => {
            const data: any = { name: 'Test Title', slug: 'test-title' };
            await service.publicEnsureSlug(data, 1, 'test-title');
            expect(data['slug']).toBeUndefined();
        });

        it('should append counter if slug exists', async () => {
            const data: any = { name: 'Test Name' };
            // First is finding if exact slug exists
            repository.findFirstRaw.mockResolvedValueOnce({ id: 2 });
            // Second loop check for "test-name-1", assume exists
            repository.findFirstRaw.mockResolvedValueOnce({ id: 3 });
            // Third loop check for "test-name-2", assume not exists
            repository.findFirstRaw.mockResolvedValueOnce(null);

            await service.publicEnsureSlug(data);

            expect(data['slug']).toBe('test-name-2');
        });
    });

    describe('changeStatus', () => {
        it('should call update with new status', async () => {
            const updateSpy = jest.spyOn(service, 'update').mockResolvedValue({ id: 1, status: 'active' });
            await service.changeStatus(1, 'active');
            expect(updateSpy).toHaveBeenCalledWith(1, { status: 'active' });
        });
    });

    describe('updateSortOrder', () => {
        it('should call update with new sort order', async () => {
            const updateSpy = jest.spyOn(service, 'update').mockResolvedValue({ id: 1, sort_order: 5 });
            await service.updateSortOrder(1, 5);
            expect(updateSpy).toHaveBeenCalledWith(1, { sort_order: 5 });
        });
    });

    describe('toggleFeatured', () => {
        it('should attempt to update is_featured first', async () => {
            const updateSpy = jest.spyOn(service, 'update').mockResolvedValue({ id: 1, is_featured: true });
            await service.toggleFeatured(1, true);
            expect(updateSpy).toHaveBeenCalledWith(1, { is_featured: true });
        });

        it('should attempt to update featured if is_featured fails', async () => {
            const updateSpy = jest.spyOn(service, 'update');
            updateSpy.mockRejectedValueOnce(new Error('Unknown column'));
            updateSpy.mockResolvedValueOnce({ id: 1, featured: true });

            await service.toggleFeatured(1, true);
            expect(updateSpy).toHaveBeenCalledWith(1, { featured: true });
        });

        it('should throw an error if both fields fail', async () => {
            const updateSpy = jest.spyOn(service, 'update');
            updateSpy.mockRejectedValue(new Error('Unknown column'));

            await expect(service.toggleFeatured(1, true)).rejects.toThrow('Model này không hỗ trợ tính năng Featured.');
        });
    });

    describe('incrementViewCount', () => {
        it('should use repository increment logic if exists', async () => {
            const mockRepoWithIncrement = {
                incrementViewCount: jest.fn().mockResolvedValue(true)
            };
            (service as any).repository = mockRepoWithIncrement;

            await service.incrementViewCount(1, 'view_count');
            expect(mockRepoWithIncrement.incrementViewCount).toHaveBeenCalledWith(1, 'view_count');
        });

        it('should manual increment if no specialised logic found in repo', async () => {
            repository.findById.mockResolvedValue({ id: 1, view_count: 5 });
            repository.update.mockResolvedValue({ id: 1, view_count: 6 });

            await service.incrementViewCount(1, 'view_count');

            expect(repository.findById).toHaveBeenCalledWith(1);
            expect(repository.update).toHaveBeenCalledWith(1, { view_count: 6 });
        });

        it('should throw error if item not found for manual increment', async () => {
            repository.findById.mockResolvedValue(null);

            await expect(service.incrementViewCount(1, 'view_count')).rejects.toThrow(NotFoundException);
        });
    });
});




