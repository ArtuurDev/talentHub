import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { HttpModule } from '@nestjs/axios';
import { CircuitBreakerModule } from '../common/circuit-breaker/circuit-breaker.module';

@Module({
  imports: [HttpModule, CircuitBreakerModule],
  providers: [ProxyService],
  exports: [ProxyService]
})
export class ProxyModule { }
