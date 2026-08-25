import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { HttpModule } from '@nestjs/axios';
import { CircuitBreakerModule } from '../common/circuit-breaker/circuit-breaker.module';
import { RetryModule } from '../common/retry/retry.module';

@Module({
  imports: [HttpModule, CircuitBreakerModule, RetryModule],
  providers: [ProxyService],
  exports: [ProxyService]
})
export class ProxyModule { }
