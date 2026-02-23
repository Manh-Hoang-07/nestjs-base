import { RequestContext } from '@/common/shared/utils/request-context.util';

describe('RequestContext', () => {
    it('should store and retrieve values within the same context', (done) => {
        const mockRequest = {} as any;
        const mockResponse = {} as any;

        RequestContext.run(mockRequest, mockResponse, () => {
            RequestContext.set('testKey', 'testValue');
            expect(RequestContext.get('testKey')).toBe('testValue');
            done();
        });
    });

    it('should return undefined if key not found in context', (done) => {
        const mockRequest = {} as any;
        const mockResponse = {} as any;

        RequestContext.run(mockRequest, mockResponse, () => {
            expect(RequestContext.get('nonExistent')).toBeUndefined();
            done();
        });
    });

    it('should support multiple concurrent contexts independent of each other', (done) => {
        const mockReq1 = {} as any;
        const mockReq2 = {} as any;

        let completed = 0;
        const checkDone = () => {
            completed++;
            if (completed === 2) done();
        };

        RequestContext.run(mockReq1, {} as any, () => {
            RequestContext.set('id', 1);

            // Simulate async work
            setTimeout(() => {
                expect(RequestContext.get('id')).toBe(1);
                checkDone();
            }, 10);
        });

        RequestContext.run(mockReq2, {} as any, () => {
            RequestContext.set('id', 2);

            setTimeout(() => {
                expect(RequestContext.get('id')).toBe(2);
                checkDone();
            }, 5);
        });
    });

    it('should return undefined if called outside of a context', () => {
        // Note: RequestContext.set will just not set anything if no store
        RequestContext.set('outside', 'value');
        expect(RequestContext.get('outside')).toBeUndefined();
    });
});




