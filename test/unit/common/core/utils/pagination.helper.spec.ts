import { createPaginationMeta, createPaginatedResult } from '@/common/core/utils/pagination.helper';

describe('PaginationHelper', () => {
    describe('createPaginationMeta', () => {
        it('should calculate metadata correctly for middle page', () => {
            const meta = createPaginationMeta(2, 10, 25);

            expect(meta).toEqual({
                page: 2,
                limit: 10,
                totalItems: 25,
                totalPages: 3,
                hasNextPage: true,
                hasPreviousPage: true,
                nextPage: 3,
                previousPage: 1,
            });
        });

        it('should calculate metadata correctly for first page', () => {
            const meta = createPaginationMeta(1, 10, 25);

            expect(meta.totalPages).toBe(3);
            expect(meta.hasNextPage).toBe(true);
            expect(meta.hasPreviousPage).toBe(false);
            expect(meta.nextPage).toBe(2);
            expect(meta.previousPage).toBeUndefined();
        });

        it('should calculate metadata correctly for last page', () => {
            const meta = createPaginationMeta(3, 10, 25);

            expect(meta.hasNextPage).toBe(false);
            expect(meta.hasPreviousPage).toBe(true);
            expect(meta.nextPage).toBeUndefined();
            expect(meta.previousPage).toBe(2);
        });

        it('should handle zero items', () => {
            const meta = createPaginationMeta(1, 10, 0);

            expect(meta.totalPages).toBe(0);
            expect(meta.totalItems).toBe(0);
            expect(meta.hasNextPage).toBe(false);
            expect(meta.hasPreviousPage).toBe(false);
        });
    });

    describe('createPaginatedResult', () => {
        it('should wrap data and meta correctly', () => {
            const data = [{ id: 1 }, { id: 2 }];
            const result = createPaginatedResult(data, 1, 10, 2);

            expect(result.data).toEqual(data);
            expect(result.meta.totalItems).toBe(2);
            expect(result.meta.page).toBe(1);
        });
    });
});




