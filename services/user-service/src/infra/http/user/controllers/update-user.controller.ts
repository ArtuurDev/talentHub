import { BadRequestException, Body, ConflictException, Controller, NotFoundException, Param, Patch } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ConflictError } from '../../../../core/errors/create-user.error'
import { InvalidEmailError } from '../../../../core/errors/invalid-email.error'
import { UserNotFoundError } from '../../../../core/errors/user-not-found.error'
import { UpdateUserUseCase } from '../../../../domain/application/use-cases/update-user.use-case'

const updateUserParamsSchema = z.object({
  userId: z.uuid(),
}).strict()

const updateUserBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.email().optional(),
  password: z.string().min(8).optional(),
  userType: z.enum(['TALENT', 'RECRUITER']).optional(),
  description: z.string().trim().min(1).max(1000).nullable().optional(),
}).strict().refine(body => Object.values(body).some(value => value !== undefined), {
  message: 'Informe ao menos um campo para atualização',
})

export type UpdateUserParamsInput = z.infer<typeof updateUserParamsSchema>
export type UpdateUserInput = z.infer<typeof updateUserBodySchema>

export class UpdateUserParamsDto extends createZodDto(updateUserParamsSchema) {}
export class UpdateUserDto extends createZodDto(updateUserBodySchema) {}

@ApiTags('Users')
@Controller('users')
export class UpdateUserController {
  constructor(private readonly updateUserUseCase: UpdateUserUseCase) {}

  @Patch(':userId')
  @ApiOperation({ summary: 'Atualiza dados de um usuário' })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'Usuário atualizado com sucesso', schema: { example: { message: 'Usuário atualizado com sucesso' } } })
  @ApiBadRequestResponse({ description: 'E-mail inválido' })
  @ApiConflictResponse({ description: 'E-mail já cadastrado' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  async handle(@Param() params: UpdateUserParamsDto, @Body() body: UpdateUserDto) {
    const result = await this.updateUserUseCase.execute({ userId: params.userId, ...body })

    if (result instanceof Error) {
      const error = result

      switch (error.constructor) {
        case ConflictError:
          throw new ConflictException(error.message)
        case UserNotFoundError:
          throw new NotFoundException(error.message)
        case InvalidEmailError:
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result
  }
}
