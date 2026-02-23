import { Test, TestingModule } from '@nestjs/testing';
import { ContentTemplateExecutionService } from '@/modules/core/content-template/services/content-template-execution.service';
import { CONTENT_TEMPLATE_REPOSITORY } from '@/modules/core/content-template/domain/content-template.repository';
import { ContentRendererService } from '@/modules/core/content-template/services/content-renderer.service';
import { MailService } from '@/core/mail/mail.service';
import { TemplateType } from '@/shared/enums/types/template-type.enum';
import { TemplateCategory } from '@/shared/enums/types/template-category.enum';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ContentTemplateExecutionService', () => {
    let service: ContentTemplateExecutionService;
    let repository: any;
    let renderer: any;
    let mailService: any;

    beforeEach(async () => {
        repository = {
            findByCode: jest.fn(),
        };
        renderer = {
            render: jest.fn((text) => text),
        };
        mailService = {
            send: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContentTemplateExecutionService,
                { provide: CONTENT_TEMPLATE_REPOSITORY, useValue: repository },
                { provide: ContentRendererService, useValue: renderer },
                { provide: MailService, useValue: mailService },
            ],
        }).compile();

        service = module.get<ContentTemplateExecutionService>(ContentTemplateExecutionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('execute', () => {
        it('should throw NotFoundException if template missing', async () => {
            repository.findByCode.mockResolvedValue(null);
            await expect(service.execute('CODE', { to: 't', variables: {} })).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if template inactive', async () => {
            repository.findByCode.mockResolvedValue({ status: BasicStatus.inactive });
            await expect(service.execute('CODE', { to: 't', variables: {} })).rejects.toThrow(BadRequestException);
        });

        it('should call handleEmail for email type', async () => {
            repository.findByCode.mockResolvedValue({
                status: BasicStatus.active,
                category: TemplateCategory.render,
                type: TemplateType.email,
                content: 'Hello',
                name: 'Welcome',
            });

            const options = { to: 'user@test.com', variables: { name: 'User' } };
            const result = await service.execute('CODE', options);

            expect(mailService.send).toHaveBeenCalled();
            expect(result.channel).toBe('email');
        });

        it('should throw implementation error for unimplemented types', async () => {
            repository.findByCode.mockResolvedValue({
                status: BasicStatus.active,
                category: TemplateCategory.render,
                type: 'invalid' as any,
            });
            await expect(service.execute('CODE', { to: 't', variables: {} })).rejects.toThrow('is not yet implemented');
        });
    });
});




