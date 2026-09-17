import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { envSchema } from './env/env';
import { UserModule } from './infra/http/user/user.module';
import { ZodValidationPipe } from './infra/http/pipes/zod-validation.pipe';
import { HttpModule } from './infra/http/http.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    HttpModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
