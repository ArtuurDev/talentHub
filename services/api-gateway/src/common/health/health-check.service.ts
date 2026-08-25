import { Injectable, Logger } from '@nestjs/common';
import { HealthStatusEnum, ServiceHealth } from './health.interface';
import { HttpService } from '@nestjs/axios';
import { CircuitBreakerService } from '../circuit-breaker/circuit-breaker.service';
import { servicesConfig } from '../../proxy/services.config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name)
  private readonly healthCache = new Map<string, ServiceHealth>()

  constructor(
    private readonly httpService: HttpService,
    private readonly circuitBreakerService: CircuitBreakerService
  ) {}

  async checkServiceHealth(serviceName: keyof typeof servicesConfig): Promise<ServiceHealth> {
    const service = servicesConfig[serviceName]
    const startTime = Date.now()

    try {
      await this.circuitBreakerService.executeWithCircuitBreaker(
        async () => {
          const response = await firstValueFrom(
            this.httpService
              .get(`${service.url}/health`, {
                timeout: service.timeout,
              })
          )

          return response.status;
        },
        `health-${serviceName}`,
        {
          failureThreshold: 5,
          timeout: 60000,
          resetTimeout: 30000,
        },
        async () => {
          throw new Error('Circuit breaker fallback')
        },
      )

      const responseTime = Date.now() - startTime;
      const serviceHealth: ServiceHealth = {
        name: serviceName,
        url: service.url,
        status: HealthStatusEnum.HEALTHY,
        responseTime,
        lastCheck: Date.now(),
      }

      this.healthCache.set(serviceName, serviceHealth)

      return serviceHealth
    } catch (error) {
      if(error instanceof Error) {
        const responseTime = Date.now() - startTime
        const serviceHealth: ServiceHealth = {
          name: serviceName,
          url: service.url,
          status: HealthStatusEnum.UNHEALTHY,
          responseTime,
          lastCheck: Date.now(),
          error: error,
        }
        this.healthCache.set(serviceName, serviceHealth)
        this.logger.error(
          `Health check failed for ${serviceName}`,
          error.message,
        )
         return serviceHealth
      }

      throw error
    }
  }

  async checkAllServices(): Promise<ServiceHealth[]> {
    const services: (keyof typeof servicesConfig)[] = [
      'users',
      'notifications'
    ]

    const healthChecks = await Promise.allSettled(
      services.map((serviceName) => this.checkServiceHealth(serviceName)),
    )

    return healthChecks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } 

      return {
        name: services[index],
        url: servicesConfig[services[index]].url,
        status: HealthStatusEnum.UNHEALTHY,
        responseTime: 0,
        lastCheck: Date.now(),
        error: result.reason?.message || 'Unknown error',
      }
    })
  }

  getCachedHealth(serviceName: string): ServiceHealth | undefined {
    return this.healthCache.get(serviceName)
  }

  getAllCachedHealth(): ServiceHealth[] {
    return Array.from(this.healthCache.values())
  }
}
