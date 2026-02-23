import { Test, TestingModule } from '@nestjs/testing';
import { CountryService } from '@/modules/core/location/country/public/services/country.service';

describe('Public CountryService', () => {
    let service: CountryService;
    let repo: any;

    beforeEach(async () => {
        repo = {
            toPrimaryKey: jest.fn((id) => id),
            findAll: jest.fn().mockResolvedValue({ data: [] }),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CountryService,
                { provide: 'ICountryRepository', useValue: repo },
            ],
        }).compile();
        service = module.get<CountryService>(CountryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should call repository.findAll', async () => {
        await service.getList({});
        expect(repo.findAll).toHaveBeenCalled();
    });
});




