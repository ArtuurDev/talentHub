import { Body, Controller, Headers, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import z from "zod/v3";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import type { IncomingHttpHeaders } from "node:http";
import { Public } from '../common/decorators/public';
import type { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { Env } from "../env";

export const loginSchema = z.object({
  password: z.string(),
  email: z.string().email()
})

export const registerSchema = z.object({
  name: z.string(),
  password: z.string(),
  email: z.string().email(),
  userType: z.enum(['TALENT', 'RECRUITER'])
})

type RegisterDTO = z.infer<typeof registerSchema>
type LoginDTO = z.infer<typeof loginSchema>

@Controller('users')
export class AuthController{
  constructor(
    private authService: AuthService,
    private configService: ConfigService<Env>
  ) {}

  @Post('login')
  @Public()
  async login(@Body(new ZodValidationPipe(loginSchema)) {
    email,
    password
  }: LoginDTO, @Headers() headers: IncomingHttpHeaders, @Res() response: Response ) {
    const result = await this.authService.login({
      email,
      method: 'POST',
      password,
      path: 'users/login',
      headers: headers,
    })

    const sevenDaysInMilisseconds = 604800000
    response.cookie('refreshToken', result?.data.refreshToken, {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === 'production',
      sameSite: 'strict',
      maxAge: sevenDaysInMilisseconds
    })
  }

  @Post('register')
  @Public()
  async register(@Body(new ZodValidationPipe(registerSchema)) {
    name,
    email,
    password,
    userType
  }: RegisterDTO, @Headers() headers: IncomingHttpHeaders) {
    return this.authService.register({
      email,
      method: 'POST',
      name,
      password,
      path: 'users/register',
      userType,
      headers: headers
    })
  }
}
