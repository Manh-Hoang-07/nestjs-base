import { Test, TestingModule } from '@nestjs/testing';
import { CountryController } from './country.controller';
import { CountryService } from '../services/country.service';

describe('Public CountryController', () => {
    let controller: CountryController;
    let service: any;

    beforeEach(async () => {
        service = { getList: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CountryController],
            providers: [{ provide: CountryService, useValue: service }],
        }).compile();
        controller = module.get<CountryController>(CountryController);
    });

    it('should call service.getList', async () => {
        await controller.getList({ s: 'VN' });
        expect(service.getList).toHaveBeenCalledWith({ s: 'VN' });
    });
});
