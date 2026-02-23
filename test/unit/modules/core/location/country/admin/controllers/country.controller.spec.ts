import { Test, TestingModule } from '@nestjs/testing';
import { AdminCountryController } from '@/modules/core/location/country/admin/controllers/country.controller';
import { AdminCountryService } from '@/modules/core/location/country/admin/services/country.service';

describe('Admin CountryController', () => {
    let controller: AdminCountryController;
    let service: any;

    beforeEach(async () => {
        service = { getList: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AdminCountryController],
            providers: [{ provide: AdminCountryService, useValue: service }],
        }).compile();
        controller = module.get<AdminCountryController>(AdminCountryController);
    });

    it('should call service.getList', async () => {
        await controller.getList({ s: 'VN' });
        expect(service.getList).toHaveBeenCalledWith({ s: 'VN' });
    });
});




