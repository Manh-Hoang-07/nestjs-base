import { prepareQuery } from '@/common/core/utils/list-query.helper';

describe('ListQueryHelper', () => {
    describe('prepareQuery', () => {
        it('should separate options and filters correctly', () => {
            const query = {
                page: '2',
                limit: '20',
                sort: 'created_at:DESC',
                search: 'test',
                status: 'active'
            };

            const result = prepareQuery(query);

            expect(result.options).toEqual({
                page: 2,
                limit: 20,
                sort: 'created_at:DESC'
            });
            expect(result.filter).toEqual({
                search: 'test',
                status: 'active'
            });
        });

        it('should handle sort_by and sort_order shorthand', () => {
            const query = {
                sort_by: 'name',
                sort_order: 'asc'
            };

            const result = prepareQuery(query);

            expect(result.options.sort).toBe('name:ASC');
        });

        it('should handle nested filters and options for backward compatibility', () => {
            const query = {
                filters: { category: 'books' },
                options: { format: 'full' },
                page: 1
            };

            const result = prepareQuery(query);

            expect(result.filter).toEqual({ category: 'books' });
            expect(result.options).toEqual({ page: 1, format: 'full' });
        });

        it('should handle empty or null query', () => {
            expect(prepareQuery(null)).toEqual({ filter: {}, options: {} });
            expect(prepareQuery({})).toEqual({ filter: {}, options: {} });
        });
    });
});




