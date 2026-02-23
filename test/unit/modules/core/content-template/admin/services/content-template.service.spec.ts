import { Test, TestingModule } from '@nestjs/testing';
import { ContentTemplateService } from '@/modules/core/content-template/admin/services/content-template.service';
import { CONTENT_TEMPLATE_REPOSITORY } from '@/modules/core/content-template/domain/content-template.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ContentTemplateService', () => {
    let service: ContentTemplateService;
    let repository: any;

    beforeEach(async () => {
        repository = {
            findByCode: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            toPrimaryKey: jest.fn((id) => id),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContentTemplateService,
                { provide: CONTENT_TEMPLATE_REPOSITORY, useValue: repository },
            ],
        }).compile();

        service = module.get<ContentTemplateService>(ContentTemplateService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findByCode', () => {
        it('should return item if found', async () => {
            repository.findByCode.mockResolvedValue({ id: 1, code: 'T1' });
            const result = await service.findByCode('T1');
            expect(result.code).toBe('T1');
        });

        it('should throw NotFoundException if not found', async () => {
            repository.findByCode.mockResolvedValue(null);
            await expect(service.findByCode('T1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('beforeCreate', () => {
        it('should throw ConflictException if code exists', async () => {
            repository.findByCode.mockResolvedValue({ id: 2 });
            await expect((service as any).beforeCreate({ code: 'CODE' })).rejects.toThrow(ConflictException);
        });

        it('should return data if code unique', async () => {
            repository.findByCode.mockResolvedValue(null);
            const data = { code: 'NEW' };
            const result = await (service as any).beforeCreate(data);
            expect(result).toBe(data);
        });
    });
});




