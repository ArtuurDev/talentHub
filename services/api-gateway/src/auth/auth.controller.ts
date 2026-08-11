import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import z from "zod/v3";
import Request from "express";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

export const loginSchema = z.object({
  password: z.string(),
  email: z.string().email()
})

export const registerSchema = z.object({
  name: z.string(),
  password: z.string(),
  email: z.string().email(),
  userType: z.enum(['talent', 'recruiter'])
})

type RegisterDTO = z.infer<typeof registerSchema>
type LoginDTO = z.infer<typeof loginSchema>

@Controller('auth')
export class AuthController{
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body(new ZodValidationPipe(loginSchema)) {
    email,
    password
  }: LoginDTO, @Req() req: Request) {
    try {
      await this.authService.login({
        data: {email, password},
        headers: req.headers
      })
    } catch (error) {
      throw error
    }
  }

  @Post('register')
  async register(@Body(new ZodValidationPipe(registerSchema)) {
    name,
    email,
    password,
    userType
  }: RegisterDTO, @Req() req: Request) {
    try {
      const response =await this.authService.register({
        data: { email, name, password, userType },
        headers: req.headers,
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
