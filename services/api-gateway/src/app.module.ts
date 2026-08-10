import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { ProxyModule } from './proxy/proxy.module';
import { MiddlewareModule } from './middleware/middleware.module';
import { LoggingMiddleware } from "./middleware/logging/logging.middleware";

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }),
  ThrottlerModule.forRoot([
    {
      ttl: 60000,
      limit: 100
    },
    {
      name: 'short',
      ttl: 1000,
      limit: 10
    },
    {
      name: 'medium',
      ttl: 60000,
      limit: 100
    },
    {
      name: 'long',
      ttl: 90000,
      limit: 1000
    }
  ]),
    ProxyModule,
    MiddlewareModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*')
  }
}