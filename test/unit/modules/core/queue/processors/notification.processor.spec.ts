import { Test, TestingModule } from '@nestjs/testing';
import { NotificationProcessor } from '@/modules/core/queue/processors/notification.processor';
import { ContentTemplateExecutionService } from '@/modules/core/content-template/services/content-template-execution.service';
import { Job } from 'bull';

describe('NotificationProcessor', () => {
    let processor: NotificationProcessor;
    let service: any;

    beforeEach(async () => {
        service = {
            execute: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationProcessor,
                { provide: ContentTemplateExecutionService, useValue: service },
            ],
        }).compile();

        processor = module.get<NotificationProcessor>(NotificationProcessor);
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    describe('handleSendEmail', () => {
        it('should call contentTemplateService.execute', async () => {
            const mockJob = {
                id: '1',
                data: {
                    templateCode: 'WELCOME',
                    options: { to: 'test@test.com' },
                },
            } as Job;

            await processor.handleSendEmail(mockJob);

            expect(service.execute).toHaveBeenCalledWith('WELCOME', { to: 'test@test.com' });
        });

        it('should throw error if execution fails', async () => {
            const mockJob = { id: '1', data: {} } as Job;
            service.execute.mockRejectedValue(new Error('Failed'));

            await expect(processor.handleSendEmail(mockJob)).rejects.toThrow('Failed');
        });
    });
});




