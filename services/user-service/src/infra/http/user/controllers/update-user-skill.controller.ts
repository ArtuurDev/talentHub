import { BadRequestException, Body, ConflictException, Controller, ForbiddenException, NotFoundException, Param, Patch } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ConflictError } from '../../../../core/errors/create-user.error'
import { UserIsNotTalentError } from '../../../../core/errors/user-is-not-talent.error'
import { UserNotFoundError } from '../../../../core/errors/user-not-found.error'
import { UserSkillNotFoundError } from '../../../../core/errors/user-skill-not-found.error'
import { ProgrammingSkill } from '../../../../domain/enterprise/entities/user-skill'
import { UpdateUserSkillUseCase } from '../../../../domain/application/use-cases/update-user-skill.use-case'

const updateUserSkillParamsSchema = z.object({ userId: z.uuid(), userSkillId: z.uuid() }).strict()
const updateUserSkillBodySchema = z.object({ skill: z.nativeEnum(ProgrammingSkill) }).strict()

export class UpdateUserSkillParamsDto extends createZodDto(updateUserSkillParamsSchema) {}
export class UpdateUserSkillDto extends createZodDto(updateUserSkillBodySchema) {}

@ApiTags('User skills')
@Controller('users')
export class UpdateUserSkillController {
  constructor(private readonly updateUserSkillUseCase: UpdateUserSkillUseCase) {}

  @Patch(':userId/skills/:userSkillId')
  @ApiOperation({ summary: 'Atualiza uma habilidade de um usuário TALENT' })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiParam({ name: 'userSkillId', format: 'uuid' })
  @ApiBody({ type: UpdateUserSkillDto })
  @ApiOkResponse({ description: 'Habilidade atualizada com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiConflictResponse({ description: 'Habilidade já cadastrada para o usuário' })
  @ApiForbiddenResponse({ description: 'O usuário não é do tipo TALENT' })
  @ApiNotFoundResponse({ description: 'Usuário ou habilidade não encontrado' })
  async handle(@Param() params: UpdateUserSkillParamsDto, @Body() body: UpdateUserSkillDto) {
    const result = await this.updateUserSkillUseCase.execute({ ...params, skill: body.skill })

    if (result instanceof Error) {
      switch (result.constructor) {
        case ConflictError:
          throw new ConflictException(result.message)
        case UserIsNotTalentError:
          throw new ForbiddenException(result.message)
        case UserNotFoundError:
        case UserSkillNotFoundError:
          throw new NotFoundException(result.message)
        default:
          throw new BadRequestException(result.message)
      }
    }

    return result
  }
}
