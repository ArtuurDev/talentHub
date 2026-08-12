import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, Res, UnauthorizedException } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import type { Response } from 'express'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { InvalidCredentialsError } from '../../../../core/errors/invalid-credentials.error'
import { LoginUserUseCase } from '../../../../domain/application/use-cases/login-user.use-case'

const loginUserSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
}).strict()

export type LoginUserInput = z.infer<typeof loginUserSchema>

export class LoginUserDto extends createZodDto(loginUserSchema) {}

@ApiTags('Users')
@Controller('users')
export class LoginUserController {
  constructor(private readonly loginUserUseCase: LoginUserUseCase) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica um usuário' })
  @ApiBody({ type: LoginUserDto })
  @ApiOkResponse({
    description: 'Token de acesso gerado; o refresh token é enviado em cookie httpOnly',
    schema: { example: { accessToken: 'eyJ...' } },
  })
  @ApiUnauthorizedResponse({ description: 'E-mail ou senha inválidos' })
  async handle(@Body() body: LoginUserDto) {
    const result = await this.loginUserUseCase.execute(body)

    if (result instanceof Error) {
      const error = result

      switch (error.constructor) {
        case InvalidCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
    
    return {
      accessToken: result.accessToken, 
      refreshToken: result.refreshToken, 
      sessionId: result.sessionId
    }
  }
}
