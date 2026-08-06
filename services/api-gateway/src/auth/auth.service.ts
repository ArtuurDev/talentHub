import { BadRequestException, Injectable } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';

export interface AuthDataLogin {
  password: string
  email: string
}

export interface AuthLoginParams {
  data: AuthDataLogin
  headers: any
}

export interface AuthDataRegister extends AuthDataLogin {
  name: string
  userType: string
}

export interface AuthRegisterParams extends Omit<AuthLoginParams, 'data'>{
  data: AuthDataRegister
}

@Injectable()
export class AuthService {
  constructor(private proxyService: ProxyService) {}

  async login({
    data,
    headers,
  }: AuthLoginParams) {

    const fields = {
      ...data,
      headers,
      method: 'POST',
      path: 'auth/login'
    }

    if(Object.values(fields).some(field => field === undefined)) {
      throw new BadRequestException('Parametros incompletos')
    }

    try {
      const response = await this.proxyService.proxyRequest({
        ...fields,
        serviceName: 'users'
      })

      return response
    } catch(error) {
      throw error
    }
  }

  async register({
    data,
    headers,
  }: AuthRegisterParams) {
      const fields = {
      ...data,
      headers,
      method: "POST",
      path: 'auth/login'
    }

    if(Object.values(fields).some(field => field === undefined)) {
      throw new BadRequestException('Parametros incompletos')
    }

    try {
      const response = await this.proxyService.proxyRequest({
        ...fields,
        serviceName: 'users'
      })
      return response
    } catch(error) {
      throw error
    }
  }
}
 