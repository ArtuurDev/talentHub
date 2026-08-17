import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CircuitBreakerOptions, CircuitBreakerState, CircuitBreakerStateEnum } from './circuit-breaker.interface';
import { AxiosError } from 'axios';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger('CircuitBreaker')
  private circuits = new Map<string, CircuitBreakerState>()
  private readonly defaultOptions: CircuitBreakerOptions = {
    failureThreshold: 5,
    timeout: 60000,
    resetTimeout: 30000
  }

  async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    key: string,
    options: CircuitBreakerOptions = this.defaultOptions,
    fallback: () => Promise<T>,
  ) {
    const circuit = this.getOrCreateCircuitBreaker(key)

    if(circuit.state === CircuitBreakerStateEnum.OPEN) {
      if(Date.now() < circuit.nextAttemptTime) {
        this.logger.error('Circuit breaker está ligado')
        return fallback()
      }
      circuit.state = CircuitBreakerStateEnum.HALF_OPEN
    } else if (circuit.state === CircuitBreakerStateEnum.HALF_OPEN) {
      return fallback()
    }

    try {
      const result = await operation()
      this.onSuccess(circuit)
      return result
    } catch(error) {
      const axiosError = error instanceof AxiosError
      const status = axiosError ? error.response?.status : undefined

      if (!status || status >= 500) {
        const circuitOpened = this.onFailure(circuit, options, key)

        if (circuitOpened) {
          return fallback()
        }
      }

      if (axiosError && error.response) {
        throw new HttpException(
          error.response.data ?? {
            message: `Erro retornado pelo serviço de ${key}`,
          },
          error.response.status,
        )
      }

      throw error
    }
  }

  private getOrCreateCircuitBreaker(key: string): CircuitBreakerState {
    if(!this.circuits.has(key)) {
      this.circuits.set(key, {
        state: CircuitBreakerStateEnum.CLOSED,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0 
      })
    }

    return this.circuits.get(key)!
  }

  private onSuccess(circuit: CircuitBreakerState) {
    circuit.state = CircuitBreakerStateEnum.CLOSED
    circuit.failureCount = 0
    this.logger.debug("Circuit breaker fechado")
  }

  private onFailure(circuit: CircuitBreakerState, options: CircuitBreakerOptions, key: string): boolean {
    circuit.failureCount ++
    circuit.lastFailureTime = Date.now()

    if(circuit.failureCount >= options.failureThreshold) {
      circuit.state = CircuitBreakerStateEnum.OPEN
      circuit.nextAttemptTime = Date.now() + options.resetTimeout
      this.logger.warn(`Circuit breaker está aberto - key: ${key}`)
      return true
    }
    return false
  }
}