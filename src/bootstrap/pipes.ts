import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { ResponseUtil } from '@/common/shared/utils';

export function applyGlobalPipes(app: INestApplication, options: { production: boolean }) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // Allow extra properties but strip them
      transformOptions: { enableImplicitConversion: true },
      disableErrorMessages: false, // Always keep errors to allow custom formatting
      exceptionFactory: (validationErrors: any[] = []) => {
        // Extract all error messages from constraints and children
        const extractMessages = (errors: any[]): string[] => {
          return errors.flatMap((error) => {
            const constraints = error.constraints ? (Object.values(error.constraints) as string[]) : [];
            const children = error.children ? extractMessages(error.children) : [];
            return [...constraints, ...children];
          });
        };

        const messages = extractMessages(validationErrors);
        const detailedMessage = messages.length > 0 ? messages[0] : 'Validation failed';

        const response = ResponseUtil.validationError(validationErrors, detailedMessage);
        return new HttpException(response, response.httpStatus || HttpStatus.BAD_REQUEST);
      },
    }),
  );
}

