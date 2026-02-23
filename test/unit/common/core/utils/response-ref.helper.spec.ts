import { HttpStatus } from '@nestjs/common';
import { handleResponseRef, ResponseRef } from '@/common/core/utils/response-ref.helper';
import { ResponseUtil } from '@/common/shared/utils';

describe('handleResponseRef', () => {
    it('should return responseRef.value if it exists', () => {
        const mockValue = { data: 'test', success: true, message: 'OK' } as any;
        const ref: ResponseRef<any> = { value: mockValue };

        expect(handleResponseRef(ref)).toEqual(mockValue);
    });

    it('should use ResponseUtil.error if value is missing', () => {
        const errorSpy = jest.spyOn(ResponseUtil, 'error').mockReturnValue({
            success: false,
            message: 'Custom Error',
            code: 'CUSTOM_ERR',
            status: HttpStatus.FORBIDDEN
        } as any);

        const ref: ResponseRef<any> = {
            message: 'Custom Error',
            code: 'CUSTOM_ERR',
            httpStatus: HttpStatus.FORBIDDEN,
            errors: { field: ['invalid'] }
        };

        const result = handleResponseRef(ref);

        expect(errorSpy).toHaveBeenCalledWith(
            'Custom Error',
            'CUSTOM_ERR',
            HttpStatus.FORBIDDEN,
            { field: ['invalid'] }
        );
        expect(result).toBeDefined();

        errorSpy.mockRestore();
    });

    it('should use default values when parameters are not provided', () => {
        const errorSpy = jest.spyOn(ResponseUtil, 'error').mockReturnValue({} as any);

        const ref: ResponseRef<any> = {};

        handleResponseRef(ref);

        expect(errorSpy).toHaveBeenCalledWith(
            'Điều kiện tiền xử lý không đạt',
            'PRECONDITION_FAILED',
            HttpStatus.BAD_REQUEST,
            undefined
        );

        errorSpy.mockRestore();
    });

    it('should use custom default functions arguments if provided', () => {
        const errorSpy = jest.spyOn(ResponseUtil, 'error').mockReturnValue({} as any);

        const ref: ResponseRef<any> = {};

        handleResponseRef(ref, 'Another default', 'ANOTHER_CODE');

        expect(errorSpy).toHaveBeenCalledWith(
            'Another default',
            'ANOTHER_CODE',
            HttpStatus.BAD_REQUEST,
            undefined
        );

        errorSpy.mockRestore();
    });
});




