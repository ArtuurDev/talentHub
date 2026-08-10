import { BadRequestException, Body, ConflictException, Controller, Post } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ConflictError } from '../../../../core/errors/create-user.error'
import { InvalidEmailError } from '../../../../core/errors/invalid-email.error'
import { CreateUserUseCase } from '../../../../domain/application/use-cases/create-user.use-case'

const createUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  password: z.string().min(8),
  userType: z.enum(['TALENT', 'RECRUITER']),
  description: z.string().trim().min(1).max(1000).optional(),
}).strict()

export type CreateUserInput = z.infer<typeof createUserSchema>

export class CreateUserDto extends createZodDto(createUserSchema) {}

@ApiTags('Users')
@Controller('users')
export class CreateUserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma conta de usuário' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: 'Usuário criado com sucesso', schema: { example: { message: 'Usuário criado com sucesso' } } })
  @ApiBadRequestResponse({ description: 'E-mail inválido' })
  @ApiConflictResponse({ description: 'E-mail já cadastrado' })
  async handle(@Body() body: CreateUserDto) {
    const result = await this.createUserUseCase.execute(body)

    if (result instanceof Error) {
      const error = result

      switch (error.constructor) {
        case ConflictError:
          throw new ConflictException(error.message)
        case InvalidEmailError:
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result
  }
}
