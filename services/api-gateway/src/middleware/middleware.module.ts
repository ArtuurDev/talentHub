import { Module } from '@nestjs/common';
import { LoggingMiddleware } from './logging/logging.middleware';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100
    }])
  ],
  providers: [LoggingMiddleware]
})
export class MiddlewareModule { }
