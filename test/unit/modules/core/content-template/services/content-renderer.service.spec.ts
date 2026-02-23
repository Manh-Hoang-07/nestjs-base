import { ContentRendererService } from '@/modules/core/content-template/services/content-renderer.service';

describe('ContentRendererService', () => {
    let service: ContentRendererService;

    beforeEach(() => {
        service = new ContentRendererService();
    });

    it('should render basic variables', () => {
        const template = 'Hello {{name}}!';
        const variables = { name: 'World' };
        expect(service.render(template, variables)).toBe('Hello World!');
    });

    it('should render nested variables', () => {
        const template = 'Welcome {{user.details.firstName}}';
        const variables = { user: { details: { firstName: 'Alice' } } };
        expect(service.render(template, variables)).toBe('Welcome Alice');
    });

    it('should leave placeholder if variable not found', () => {
        const template = 'Value: {{missing}}';
        expect(service.render(template, {})).toBe('Value: {{missing}}');
    });

    it('should handle multiple occurrences', () => {
        const template = '{{a}} + {{b}} = {{sum}}';
        const variables = { a: 1, b: 2, sum: 3 };
        expect(service.render(template, variables)).toBe('1 + 2 = 3');
    });

    it('should handle spaces in placeholders', () => {
        const template = 'Hello {{ name }}';
        const variables = { name: 'Bob' };
        expect(service.render(template, variables)).toBe('Hello Bob');
    });

    it('should return empty string if content is empty', () => {
        expect(service.render('', {})).toBe('');
    });
});




