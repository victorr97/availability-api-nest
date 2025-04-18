import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    let message: string | object;
    let error: string | undefined;
    let details: object | undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      message = exceptionResponse['message'] || exceptionResponse;
      error = exceptionResponse['error']; // Extract the error type if available
      details = exceptionResponse['details']; // Extract additional details if available
    } else {
      message = 'An unexpected error occurred';
    }

    // If the message is a string, ensure it is cleaned
    if (typeof message === 'string') {
      message = message.replace(/\\\"/g, '"'); // Remove backslashes from quotes
      message = message.replace(/\"/g, ''); // Remove double quotes if present
    }

    const responseBody: any = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    };

    if (error) {
      responseBody.error = error; // Add the error type if available
    }

    if (details) {
      responseBody.details = details; // Add additional details if available
    }

    response.status(status).json(responseBody);
  }
}
