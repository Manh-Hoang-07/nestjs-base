import { Test, TestingModule } from '@nestjs/testing';
import { ContentTemplateController } from '@/modules/core/content-template/admin/controllers/content-template.controller';
import { ContentTemplateService } from '@/modules/core/content-template/admin/services/content-template.service';
import { ContentTemplateExecutionService } from '@/modules/core/content-template/services/content-template-execution.service';

describe('Admin ContentTemplateController', () => {
    let controller: ContentTemplateController;
    let service: any;
    let executionService: any;

    beforeEach(async () => {
        service = {
            create: jest.fn(),
            getList: jest.fn(),
            getOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        executionService = {
            execute: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ContentTemplateController],
            providers: [
                { provide: ContentTemplateService, useValue: service },
                { provide: ContentTemplateExecutionService, useValue: executionService },
            ],
        }).compile();

        controller = module.get<ContentTemplateController>(ContentTemplateController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('testExecute', () => {
        it('should call executionService.execute', async () => {
            const body = { to: 'test@test.com', variables: { name: 'V' } };
            await controller.testExecute('CODE', body);
            expect(executionService.execute).toHaveBeenCalledWith('CODE', {
                to: body.to,
                variables: body.variables,
            });
        });
    });
});




