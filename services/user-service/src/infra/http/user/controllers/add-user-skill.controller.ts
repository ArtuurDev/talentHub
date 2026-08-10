import { BadRequestException, Body, ConflictException, Controller, ForbiddenException, NotFoundException, Param, Post } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ConflictError } from '../../../../core/errors/create-user.error'
import { UserIsNotTalentError } from '../../../../core/errors/user-is-not-talent.error'
import { UserNotFoundError } from '../../../../core/errors/user-not-found.error'
import { ProgrammingSkill } from '../../../../domain/enterprise/entities/user-skill'
import { AddUserSkillUseCase } from '../../../../domain/application/use-cases/add-user-skill.use-case'

const addUserSkillParamsSchema = z.object({ userId: z.uuid() }).strict()
const addUserSkillBodySchema = z.object({ skill: z.enum(ProgrammingSkill) }).strict()

export class AddUserSkillParamsDto extends createZodDto(addUserSkillParamsSchema) {}
export class AddUserSkillDto extends createZodDto(addUserSkillBodySchema) {}

@ApiTags('User skills')
@Controller('users')
export class AddUserSkillController {
  constructor(private readonly addUserSkillUseCase: AddUserSkillUseCase) {}

  @Post(':userId/skills')
  @ApiOperation({ summary: 'Adiciona uma habilidade a um usuário TALENT' })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiBody({ type: AddUserSkillDto })
  @ApiCreatedResponse({ description: 'Habilidade adicionada com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiConflictResponse({ description: 'Habilidade já cadastrada para o usuário' })
  @ApiForbiddenResponse({ description: 'O usuário não é do tipo TALENT' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  async handle(@Param() params: AddUserSkillParamsDto, @Body() body: AddUserSkillDto) {
    const result = await this.addUserSkillUseCase.execute({ userId: params.userId, skill: body.skill })

    if (result instanceof Error) {
      switch (result.constructor) {
        case ConflictError:
          throw new ConflictException(result.message)
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
