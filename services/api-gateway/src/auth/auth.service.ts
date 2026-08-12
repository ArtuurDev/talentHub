import { Injectable } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { IncomingHttpHeaders } from 'node:http';

export interface AuthDataLoginParams {
  password: string
  email: string
  sessionId?: string
  headers?: IncomingHttpHeaders
  method: string
  path: string
}

export interface AuthRegisterParams {
  name: string
  password: string
  email: string
  userType: string
  headers?: IncomingHttpHeaders
  method: string
  path: string
}

export interface ValidateSessionParams {
  refreshToken: string
  sessionId: string
  method: string
  path: string
  headers?: IncomingHttpHeaders 
}

@Injectable()
export class AuthService {
  constructor(private proxyService: ProxyService) {}

  async login({
    email,
    password,
    headers,
    method,
    path,
    sessionId
  }: AuthDataLoginParams) {

    const response = await this.proxyService.proxyRequest({
      userInfo: {sessionId},
      data: {email, password},
      method,
      path,
      headers,
      serviceName: 'users'
    })

    return response
  }

  async validateSession({
    method,
    path,
    refreshToken,
    sessionId,
    headers
  }: ValidateSessionParams) {
    const response = await this.proxyService.proxyRequest({
      userInfo: {sessionId},
      data: {refreshToken},
      method,
      path,
      serviceName: 'users',
      headers
    })

    return response
  }

  async register({
    email,
    name,
    password,
    userType,
    headers,
    method,
    path
  }: AuthRegisterParams) {

    const response = await this.proxyService.proxyRequest({
      data: {email, name, userType, password},
      method,
      path,
      headers,
      serviceName: 'users'
    })

    return response
  }
}
 