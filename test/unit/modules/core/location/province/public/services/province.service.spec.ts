import { Test, TestingModule } from '@nestjs/testing';
import { ProvinceService } from '@/modules/core/location/province/public/services/province.service';

describe('Public ProvinceService', () => {
    let service: ProvinceService;
    let repo: any;

    beforeEach(async () => {
        repo = {
            toPrimaryKey: jest.fn((id) => id),
            findAll: jest.fn().mockResolvedValue({ data: [] }),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProvinceService,
                { provide: 'IProvinceRepository', useValue: repo },
            ],
        }).compile();
        service = module.get<ProvinceService>(ProvinceService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should call repository.findAll', async () => {
        await service.getList({});
        expect(repo.findAll).toHaveBeenCalled();
    });
});




