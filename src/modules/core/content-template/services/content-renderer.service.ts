import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentRendererService {
    /**
     * Render content with given variables
     * Supported format: {{variable_name}}
     */
    render(content: string, variables: Record<string, any>): string {
        if (!content) return '';
        if (!variables) return content;

        return content.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
            return this.getValueByPath(variables, key) ?? match;
        });
    }

    /**
     * Get value from object by path (e.g. "user.name")
     */
    private getValueByPath(obj: any, path: string): any {
        return path.split('.').reduce((prev, curr) => {
            return prev ? prev[curr] : undefined;
        }, obj);
    }
}
