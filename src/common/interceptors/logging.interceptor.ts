import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip;

    const now = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    if (body && typeof body === 'object' && Object.keys(body).length > 0) {
      this.logger.log(`Request Body: ${JSON.stringify(body)}`);
    }

    if (query && typeof query === 'object' && Object.keys(query).length > 0) {
      this.logger.log(`Query Params: ${JSON.stringify(query)}`);
    }

    if (params && typeof params === 'object' && Object.keys(params).length > 0) {
      this.logger.log(`Route Params: ${JSON.stringify(params)}`);
    }
    
    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - now;
        this.logger.log(
          `Outgoing Response: ${method} ${url} - ${response.statusCode} - ${duration}ms`,
        );
      }),
    );
  }
}