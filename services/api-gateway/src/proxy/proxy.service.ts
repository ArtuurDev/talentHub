import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { servicesConfig } from './services.config';
import { firstValueFrom } from 'rxjs';
import { CircuitBreakerService } from '../common/circuit-breaker/circuit-breaker.service';
  
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
    private readonly circuitBreakerService: CircuitBreakerService
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
      () => {
        throw new Error(`${serviceName} está temporarimente indisponivel`)
      }
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
    return response
  }

}
