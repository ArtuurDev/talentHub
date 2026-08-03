import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { servicesConfig } from './services.config';
import { firstValueFrom } from 'rxjs';

export interface UserInfo {
  userId: string
  role: string
}

export interface ProxyRequestParams {
  serviceName: keyof typeof servicesConfig
  headers?: any
  path: string
  data?: any
  userInfo: UserInfo,
  method: string
}

@Injectable()
export class ProxyService {

  private readonly logger = new Logger(ProxyService.name)

  constructor(
    private readonly httpService: HttpService
  ) { }

  async proxyRequest({
    path,
    serviceName,
    data,
    headers,
    userInfo,
    method
  }: ProxyRequestParams) {
    const service = servicesConfig[serviceName]
    const url = `${service.url}/${path}`

    this.logger.log(`Realizando requisição no metodo ${method} para o serviço ${servicesConfig}`)

    try {
      const finalHeaders = {
        ...headers,
        'x-user-id': userInfo.userId,
        'x-user-role': userInfo.role
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

    } catch (error) {
      this.logger.error(
        `Error ao relizar requsição para o serviço ${serviceName} com o metodo ${method}`
      )
      throw error
    }

  }

  async getServiceHealth(serviceName: keyof typeof servicesConfig) {
    try {
      const service = servicesConfig[serviceName]

      const response = await firstValueFrom(
        this.httpService.get(`${service.url}/health`, {
          timeout: 3000,
        }),
      );

      return { status: 'healthy', data: response.data }
    } catch (error) {
      return { status: 'unhealthy', error: error.message }
    }
  }

}
