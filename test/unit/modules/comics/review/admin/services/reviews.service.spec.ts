import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from '@/modules/comics/review/admin/services/reviews.service';
import { REVIEW_REPOSITORY } from '@/modules/comics/review/domain/review.repository';

describe('ReviewsService', () => {
    let service: ReviewsService;
    let repository: any;

    beforeEach(async () => {
        repository = {
            count: jest.fn(),
            getAverageRating: jest.fn(),
            getRatingDistribution: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            delegate: {
                findFirst: jest.fn(),
            },
            toPrimaryKey: jest.fn((id) => id),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewsService,
                {
                    provide: REVIEW_REPOSITORY,
                    useValue: repository,
                },
            ],
        }).compile();

        service = module.get<ReviewsService>(ReviewsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('prepareFilters', () => {
        it('should transform rating range filters', async () => {
            const filters = { rating_min: 3, rating_max: 5 };
            const result = await (service as any).prepareFilters(filters);
            expect(result.rating).toEqual({ gte: 3, lte: 5 });
        });

        it('should transform search filter to content contains', async () => {
            const filters = { search: 'good' };
            const result = await (service as any).prepareFilters(filters);
            expect(result.content).toEqual({ contains: 'good' });
            expect(result.search).toBeUndefined();
        });
    });

    describe('getStatistics', () => {
        it('should return aggregated statistics', async () => {
            repository.count.mockResolvedValue(10);
            repository.getAverageRating.mockResolvedValue(4.5);
            repository.getRatingDistribution.mockResolvedValue({ 5: 5, 4: 5 });

            const result = await service.getStatistics();

            expect(result.total).toBe(10);
            expect(result.average_rating).toBe(4.5);
            expect(result.rating_distribution).toEqual({ 5: 5, 4: 5 });
        });
    });
});




