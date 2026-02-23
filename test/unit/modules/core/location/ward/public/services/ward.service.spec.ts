import { Test, TestingModule } from '@nestjs/testing';
import { WardService } from '@/modules/core/location/ward/public/services/ward.service';

describe('Public WardService', () => {
    let service: WardService;
    let repo: any;

    beforeEach(async () => {
        repo = {
            toPrimaryKey: jest.fn((id) => id),
            findAll: jest.fn().mockResolvedValue({ data: [] }),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WardService,
                { provide: 'IWardRepository', useValue: repo },
            ],
        }).compile();
        service = module.get<WardService>(WardService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should call repository.findAll', async () => {
        await service.getList({});
        expect(repo.findAll).toHaveBeenCalled();
    });
});




