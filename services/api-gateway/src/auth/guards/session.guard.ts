import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import {Request, Response } from "express";


@Injectable()
export class SessionGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    if(!request.cookies['x-refresh-token'] || !request.cookies['x-session-id']) {
      return false
    }
    return true
  }

}