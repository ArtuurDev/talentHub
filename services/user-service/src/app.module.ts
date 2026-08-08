import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { UserModule } from './infra/http/user/user.module';
import { ZodValidationPipe } from './infra/http/pipes/zod-validation.pipe';


@Module({
  imports: [UserModule],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
