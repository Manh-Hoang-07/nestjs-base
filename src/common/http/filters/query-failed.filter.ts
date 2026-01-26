import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from '@prisma/client';
import { ResponseUtil } from '@/common/shared/utils';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientUnknownRequestError, Prisma.PrismaClientRustPanicError, Prisma.PrismaClientInitializationError, Prisma.PrismaClientValidationError)
export class QueryFailedFilter implements ExceptionFilter {
  private readonly logger = new Logger(QueryFailedFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientUnknownRequestError | Prisma.PrismaClientRustPanicError | Prisma.PrismaClientInitializationError | Prisma.PrismaClientValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database query failed';
    let errors: any = null;

    // Handle Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const error = exception as Prisma.PrismaClientKnownRequestError;
      
      switch (error.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'Duplicate entry detected';
          errors = {
            field: error.meta?.target ? (Array.isArray(error.meta.target) ? error.meta.target[0] : error.meta.target) : 'unknown',
            constraint: error.meta?.target,
          };
          break;
          
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Referenced record does not exist';
          break;
          
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
          
        case 'P2014':
          status = HttpStatus.CONFLICT;
          message = 'Cannot delete record - it is referenced by other records';
          break;
          
        case 'P2000':
          status = HttpStatus.BAD_REQUEST;
          message = 'Data too long for column';
          break;
          
        case 'P2011':
          status = HttpStatus.BAD_REQUEST;
          message = 'Required field cannot be null';
          break;
          
        case 'P2012':
          status = HttpStatus.BAD_REQUEST;
          message = 'Field requires a value';
          break;
          
        default:
          message = error.message || 'Database query failed';
          this.logger.error(
            'Prisma database error:',
            JSON.stringify({
              code: error.code,
              message: error.message,
              meta: error.meta,
            }),
            error.stack || undefined,
          );
          break;
      }
    } else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unknown database error occurred';
      this.logger.error('Unknown Prisma error:', exception.message, exception.stack);
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database connection failed';
      this.logger.error('Prisma initialization error:', exception.message, exception.stack);
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database validation error';
      this.logger.error('Prisma validation error:', exception.message, exception.stack);
    }

    // Log the database error (avoid leaking sensitive parameters in production)
    const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';

    this.logger.error(
      `Database Error: ${message}`,
      JSON.stringify({
        path: request.url,
        method: request.method,
        error: exception instanceof Prisma.PrismaClientKnownRequestError ? {
          code: exception.code,
          meta: exception.meta,
        } : { message: exception.message },
        timestamp: new Date().toISOString(),
      }),
      exception.stack || undefined,
    );

    // Create standardized error response
    const errorResponse = ResponseUtil.error(message, 'ERROR', status, errors);

    response.status(status).json(errorResponse);
  }

}
