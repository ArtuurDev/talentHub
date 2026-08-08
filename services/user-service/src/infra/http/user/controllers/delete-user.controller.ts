import { BadRequestException, Controller, Delete, HttpCode, HttpStatus, NotFoundException, Param } from '@nestjs/common'
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { UserNotFoundError } from '../../../../core/errors/user-not-found.error'
import { DeleteUserUseCase } from '../../../../domain/application/use-cases/delete-user.use-case'

const deleteUserParamsSchema = z.object({
  userId: z.uuid(),
}).strict()

export type DeleteUserParamsInput = z.infer<typeof deleteUserParamsSchema>

export class DeleteUserParamsDto extends createZodDto(deleteUserParamsSchema) {}

@ApiTags('Users')
@Controller('users')
export class DeleteUserController {
  constructor(private readonly deleteUserUseCase: DeleteUserUseCase) {}

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui uma conta de usuário' })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Conta excluída com sucesso' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  async handle(@Param() params: DeleteUserParamsDto): Promise<void> {
    const result = await this.deleteUserUseCase.execute({ userId: params.userId })

    if (result instanceof Error) {
      const error = result

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
