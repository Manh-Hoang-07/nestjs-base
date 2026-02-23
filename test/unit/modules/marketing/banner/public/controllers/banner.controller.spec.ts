import { Test, TestingModule } from '@nestjs/testing';
import { PublicBannerController } from '@/modules/marketing/banner/public/controllers/banner.controller';
import { PublicBannerService } from '@/modules/marketing/banner/public/services/banner.service';

describe('PublicBannerController', () => {
    let controller: PublicBannerController;
    let service: any;

    beforeEach(async () => {
        service = {
            getList: jest.fn(),
            getOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PublicBannerController],
            providers: [
                {
                    provide: PublicBannerService,
                    useValue: service,
                },
            ],
        }).compile();

        controller = module.get<PublicBannerController>(PublicBannerController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call findActiveBanners with locationCode', async () => {
        await controller.findActiveBanners('LOC1');
        expect(service.getList).toHaveBeenCalledWith({ locationCode: 'LOC1', status: 'active' });
    });

    it('should call findActiveBanners without locationCode', async () => {
        await controller.findActiveBanners();
        expect(service.getList).toHaveBeenCalledWith({ locationCode: undefined, status: 'active' });
    });

    it('should call findBannerById', async () => {
        await controller.findBannerById('1');
        expect(service.getOne).toHaveBeenCalledWith(1);
    });
});
