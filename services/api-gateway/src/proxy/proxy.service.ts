import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { servicesConfig } from './services.config';
import { firstValueFrom } from 'rxjs';
import { CircuitBreakerService } from '../common/circuit-breaker/circuit-breaker.service';
import { DefaultFallbackService } from '../common/fallback/default-fallback.service';
import { CacheFallbackService } from '../common/fallback/cache-fallback.service';
  
export interface UserInfo {
  userId?: string
  sessionId?: string
}

export interface ProxyRequestParams {
  serviceName: keyof typeof servicesConfig
  headers?: any
  path: string
  data?: any
  userInfo?: UserInfo,
  method: string
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name)

  constructor(
    private readonly httpService: HttpService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly cacheFallbackService: CacheFallbackService,
    private readonly defaultFallbackService: DefaultFallbackService,
  ) { }

  async proxyRequest({
    path,
    serviceName,
    data,
    headers,
    userInfo,
    method
  }: ProxyRequestParams) {
    this.logger.log(`Realizando requisição no metodo ${method} para o serviço ${servicesConfig}`)

    const fallback = this.createServiceFallback(serviceName, method, path);

    return this.circuitBreakerService.executeWithCircuitBreaker(
      () => this.handleRequest({
        method,
        path,
        serviceName,
        data,
        headers,
        userInfo
      }),
      `proxy-${serviceName}`,
      {failureThreshold: 3, resetTimeout: 60000, timeout: 30000},
      fallback
    )
  }

   private async handleRequest({
    path,
    serviceName,
    data,
    headers,
    userInfo,
    method
  }: ProxyRequestParams)  {
    const service = servicesConfig[serviceName]
    const url = `${service.url}/${path}`

    const finalHeaders = {
      ...headers,
      'x-user-id': userInfo ? userInfo.userId : null,
      'x-session-id': userInfo ? userInfo.sessionId : null,
      }

    const response = await firstValueFrom(
      this.httpService.request({
        method: method.toLowerCase(),
        url,
        data,
        headers: { ...finalHeaders },
        timeout: service.timeout
      })
    )

    if(method.toLowerCase() === 'GET') {
        this.cacheFallbackService.setCachedData(
          `${serviceName}-${path}`,
          response.data,
        )
      }

    return response.data

  }

  private createServiceFallback(
    serviceName: string,
    method: string,
    path: string,
  ) {
    switch (serviceName) {
      case 'users':
        if (path.includes('users/login')) {
          return this.defaultFallbackService.createErrorFallback(
            'users',
            'Authentication service unavailable',
          )
        }

        return this.defaultFallbackService.createErrorFallback(
          'users',
          'User service unavailable',
        )
      case 'notifications':
        if (method.toLowerCase() === 'GET') {
          return this.cacheFallbackService.createCacheFallback(
            `notifications-${path}`,
            { notifcations: [], total: 0, page: 1, limit: 10 },
          )
        }
        return this.defaultFallbackService.createErrorFallback(
          'notifications',
          'Notifications service unavailable',
        )
      default:
        return this.defaultFallbackService.createErrorFallback(
          serviceName,
          'Service unavailable',
        )
    }
  }
}
