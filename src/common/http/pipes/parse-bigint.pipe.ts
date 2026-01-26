import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseBigIntPipe implements PipeTransform<string | number, bigint> {
    transform(value: string | number): bigint {
        try {
            if (value === undefined || value === null) {
                throw new BadRequestException('Validation failed (BigInt string is expected)');
            }
            return BigInt(value);
        } catch (error) {
            throw new BadRequestException('Validation failed (BigInt string is expected)');
        }
    }
}
