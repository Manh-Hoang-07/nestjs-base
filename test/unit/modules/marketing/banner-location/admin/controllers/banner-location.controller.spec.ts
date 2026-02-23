import { Test, TestingModule } from '@nestjs/testing';
import { BannerLocationController } from '@/modules/marketing/banner-location/admin/controllers/banner-location.controller';
import { BannerLocationService } from '@/modules/marketing/banner-location/admin/services/banner-location.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { JwtAuthGuard, RbacGuard } from '@/common/auth/guards';

describe('BannerLocationController (Admin)', () => {
    let controller: BannerLocationController;
    let service: any;

    beforeEach(async () => {
        service = {
            create: jest.fn(),
            getList: jest.fn(),
            getSimpleList: jest.fn(),
            getOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            changeStatus: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [BannerLocationController],
            providers: [
                {
                    provide: BannerLocationService,
                    useValue: service,
                },
                { provide: 'JwtAuthGuard', useValue: { canActivate: jest.fn(() => true) } },
                { provide: 'RbacGuard', useValue: { canActivate: jest.fn(() => true) } },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RbacGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<BannerLocationController>(BannerLocationController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call create', async () => {
        const dto = { name: 'Location', code: 'LOC1' } as any;
        await controller.create(dto);
        expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should call findAll', async () => {
        const query = { page: 1 } as any;
        await controller.findAll(query);
        expect(service.getList).toHaveBeenCalledWith(query);
    });

    it('should call getSimpleList', async () => {
        const query = { limit: 10 } as any;
        await controller.getSimpleList(query);
        expect(service.getSimpleList).toHaveBeenCalledWith(query);
    });

    it('should call findOne with converted id', async () => {
        await controller.findOne('1');
        expect(service.getOne).toHaveBeenCalledWith(1);
    });

    it('should call update with converted id', async () => {
        const dto = { name: 'Updated' } as any;
        await controller.update('1', dto);
        expect(service.update).toHaveBeenCalledWith(1, dto);
    });

    it('should call remove with converted id', async () => {
        await controller.remove('1');
        expect(service.delete).toHaveBeenCalledWith(1);
    });

    it('should call changeStatus with converted id', async () => {
        await controller.changeStatus('1', BasicStatus.active);
        expect(service.changeStatus).toHaveBeenCalledWith(1, BasicStatus.active);
    });
});

