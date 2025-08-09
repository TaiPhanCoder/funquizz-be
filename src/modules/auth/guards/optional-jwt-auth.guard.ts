import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to allow requests without authentication
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If there's an error or no user, just return null (don't throw)
    // This allows the request to continue without authentication
    return user || null;
  }

  // Override canActivate to always return true
  canActivate(context: ExecutionContext) {
    // Always allow the request to proceed
    const result = super.canActivate(context);
    if (result instanceof Promise) {
      return result.then(() => true).catch(() => true);
    }
    return true;
  }
}