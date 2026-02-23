import { Test, TestingModule } from '@nestjs/testing';
import { AdminCountryService } from '@/modules/core/location/country/admin/services/country.service';

describe('AdminCountryService', () => {
    let service: AdminCountryService;
    let repository: any;

    beforeEach(async () => {
        repository = {
            toPrimaryKey: jest.fn((id) => id),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdminCountryService,
                { provide: 'ICountryRepository', useValue: repository },
            ],
        }).compile();

        service = module.get<AdminCountryService>(AdminCountryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});




