import { BadRequestException, Controller, ForbiddenException, Get, NotFoundException, Param } from '@nestjs/common'
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { UserIsNotTalentError } from '../../../../core/errors/user-is-not-talent.error'
import { UserNotFoundError } from '../../../../core/errors/user-not-found.error'
import { ListUserSkillsUseCase } from '../../../../domain/application/use-cases/list-user-skills.use-case'

const listUserSkillsParamsSchema = z.object({ userId: z.uuid() }).strict()

export class ListUserSkillsParamsDto extends createZodDto(listUserSkillsParamsSchema) {}

@ApiTags('User skills')
@Controller('users')
export class ListUserSkillsController {
  constructor(private readonly listUserSkillsUseCase: ListUserSkillsUseCase) {}

  @Get(':userId/skills')
  @ApiOperation({ summary: 'Lista todas as habilidades de um usu\u00e1rio TALENT' })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiOkResponse({ description: 'Habilidades encontradas' })
  @ApiBadRequestResponse({ description: 'Dados inv\u00e1lidos' })
  @ApiForbiddenResponse({ description: 'O usu\u00e1rio n\u00e3o \u00e9 do tipo TALENT' })
  @ApiNotFoundResponse({ description: 'Usu\u00e1rio n\u00e3o encontrado' })
  async handle(@Param() params: ListUserSkillsParamsDto) {
    const result = await this.listUserSkillsUseCase.execute({ userId: params.userId })

    if (result instanceof Error) {
      switch (result.constructor) {
        case UserIsNotTalentError:
          throw new ForbiddenException(result.message)
        case UserNotFoundError:
          throw new NotFoundException(result.message)
        default:
          throw new BadRequestException(result.message)
      }
    }

    return result
  }
}
