import { BadRequestException, Controller, Delete, ForbiddenException, HttpCode, HttpStatus, NotFoundException, Param } from '@nestjs/common'
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { UserIsNotTalentError } from '../../../../core/errors/user-is-not-talent.error'
import { UserNotFoundError } from '../../../../core/errors/user-not-found.error'
import { UserSkillNotFoundError } from '../../../../core/errors/user-skill-not-found.error'
import { DeleteUserSkillUseCase } from '../../../../domain/application/use-cases/delete-user-skill.use-case'

const deleteUserSkillParamsSchema = z.object({ userId: z.uuid(), userSkillId: z.uuid() }).strict()

export class DeleteUserSkillParamsDto extends createZodDto(deleteUserSkillParamsSchema) {}

@ApiTags('User skills')
@Controller('users')
export class DeleteUserSkillController {
  constructor(private readonly deleteUserSkillUseCase: DeleteUserSkillUseCase) {}

  @Delete(':userId/skills/:userSkillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui uma habilidade de um usuário TALENT' })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiParam({ name: 'userSkillId', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Habilidade excluída com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiForbiddenResponse({ description: 'O usuário não é do tipo TALENT' })
  @ApiNotFoundResponse({ description: 'Usuário ou habilidade não encontrado' })
  async handle(@Param() params: DeleteUserSkillParamsDto): Promise<void> {
    const result = await this.deleteUserSkillUseCase.execute(params)

    if (result instanceof Error) {
      switch (result.constructor) {
        case UserIsNotTalentError:
          throw new ForbiddenException(result.message)
        case UserNotFoundError:
        case UserSkillNotFoundError:
          throw new NotFoundException(result.message)
        default:
          throw new BadRequestException(result.message)
      }
    }
  }
}
