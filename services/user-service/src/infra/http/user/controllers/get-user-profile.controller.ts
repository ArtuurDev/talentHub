import { BadRequestException, Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { UserNotFoundError } from '../../../../core/errors/user-not-found.error'
import { GetUserProfileUseCase } from '../../../../domain/application/use-cases/get-user-profile.use-case'

const getUserProfileParamsSchema = z.object({
  userId: z.uuid(),
}).strict()

export type GetUserProfileParamsInput = z.infer<typeof getUserProfileParamsSchema>

export class GetUserProfileParamsDto extends createZodDto(getUserProfileParamsSchema) {}

@ApiTags('Users')
@Controller('users')
export class GetUserProfileController {
  constructor(private readonly getUserProfileUseCase: GetUserProfileUseCase) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Busca o perfil de um usuário' })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiOkResponse({
    description: 'Perfil encontrado',
    schema: { example: { id: 'uuid', name: 'Jane Doe', email: 'jane@example.com', userType: 'TALENT' } },
  })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  async handle(@Param() params: GetUserProfileParamsDto) {
    const result = await this.getUserProfileUseCase.execute({ userId: params.userId })

    if (result instanceof Error) {
      const error = result

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result
  }
}
